import type { PackageJson } from 'pkg-types'
import type { Window } from './window'
import type { BridgeRequest } from '~/common/bridge'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { Worker } from 'node:worker_threads'
import { withTimeout } from '@zunh/promise-kit'
import { app } from 'electron'
import { join, normalize } from 'pathe'
import { Bridge } from '~/common/bridge'
import { registerRouterToBridge } from '~/common/router'
import { extensionRouter } from '~/node/database/router'
import { getEnv } from '~/node/database/service/kv'
import { logger } from './logger'

const configName = 'package.json'

export interface IExtensionProcessInfo {
  readonly pid: number
  readonly id: string
  readonly manifest: PackageJson
}

export interface IExtensionConfig extends PackageJson {
  permissions?: {
    env?: Record<string, string>
  }
}

export class ExtensionProcess extends Bridge {
  private static ID_COUNTER = 0
  private readonly id = String(++ExtensionProcess.ID_COUNTER)
  private readonly pid = process.pid
  private static readonly all = new Map<number, IExtensionProcessInfo>()
  process: Worker | null = null
  manifest: PackageJson | null = null
  readme: string | null = null
  static getAll(): IExtensionProcessInfo[] {
    return Array.from(ExtensionProcess.all.values())
  }

  static getById(id: number): IExtensionProcessInfo | undefined {
    return ExtensionProcess.all.get(id)
  }

  /**
   * @description 扩展进程文件夹路径
   */
  _path: string
  /**
   * @description 扩展进程配置
   */
  _config: IExtensionConfig
  /**
   * @description 渲染进程进程窗口
   */
  // _window: Window
  _port: number

  constructor(path: string, port: number, config: IExtensionConfig = { env: {} }) {
    super()
    this._path = path
    this._config = config
    this._port = port

    // 赋予扩展进程的 操控database 的权限
    registerRouterToBridge(this, extensionRouter, 'database')

    // 将部分渲染进程的消息转发到扩展进程
    // window.use((data) => {
    //   if (data.name.startsWith('extension.')) {
    //     // 处理扩展进程的消息
    //     this.send(data)
    //     return
    //   }

    //   return data
    // })

    // 将渲染进程的消息转发到win 进程
    // this.use((data) => {
    //   if (data.name.startsWith('window.')) {
    //     // 处理扩展进程的消息
    //     window.send(data)
    //     return
    //   }

    //   return data
    // })

    this.on('_extension.ready', () => {
      this.activate()
        .catch((error) => {
          logger.error(`Failed to activate extension: ${error?.message}`)
        })
    })

    // this.on('_extension.error', (error: string) => {
    //   logger.error(`Extension error: ${error}`)
    //   this._window.emit('extension.error', { id: this.id, error })
    // })
  }

  async getMetafile() {
    return {
      path: this._path,
      packageJson: this.manifest,
      readme: (await this.readReadme()) || undefined,
    }
  }

  getId(): string {
    return this.id
  }

  private async readManifest(): Promise<IExtensionConfig> {
    const configFile = resolve(this._path, configName)
    if (!configFile.endsWith('.json') || !existsSync(configFile)) {
      throw new Error(`Config file ${configFile} does not exist or is not a JSON file`)
    }

    try {
      const value = await readFile(configFile, 'utf-8')
      const manifestValue = JSON.parse(value) as PackageJson
      const resolvedManifest = JSON.parse(value) as IExtensionConfig

      if (manifestValue.permissions && manifestValue.permissions.env && Array.isArray(manifestValue.permissions.env)) {
        Object.assign(resolvedManifest, {
          permissions: {
            env: {},
          },
        })
        for (const key of manifestValue.permissions.env) {
          const envValue = process.env[key] || (await getEnv(key)
            .catch(() => undefined))
          resolvedManifest.permissions!.env![key] = envValue as string
        }
      }

      this.manifest = resolvedManifest as IExtensionConfig

      return resolvedManifest
    }
    catch (e) {
      throw new Error(`Failed to read config file ${configFile}: ${e}`)
    }
  }

  private async readReadme(): Promise<string | null> {
    if (this.readme) {
      return this.readme
    }

    const readme = ['README.md', 'README.txt'].find((file) => {
      return existsSync(resolve(this._path, file))
    })

    if (!readme) {
      logger.warn('No README file found in the extension directory')
      return null
    }

    try {
      const content = await readFile(resolve(this._path, readme), 'utf-8')
      this.readme = content
      return content
    }
    catch (e) {
      logger.error(`Failed to read README file: ${e}`)
      return null
    }
  }

  private async activate() {
    return await this.invoke('_extension.activate')
  }

  private async deactivate() {
    return await this.invoke('_extension.deactivate')
  }

  async start(): Promise<void> {
    logger.info('Starting extension process', this.id, this.pid, this._path)
    try {
      performance.mark('start-extension')
      const manifest = await this.readManifest()

      if (!manifest || !manifest.main) {
        return
      }
      const mainFile = resolve(this._path, manifest.main)
      if (!existsSync(mainFile)) {
        throw new Error(`Main file ${mainFile} does not exist`)
      }

      const extensionNeedEnv = (manifest.permissions && manifest.permissions.env) ? manifest.permissions.env : {}

      if (!this.manifest) {
        throw new Error('Manifest is not defined')
      }

      const nodeModulesRoot = app.isPackaged ? app.getPath('exe') : resolve(app.getAppPath(), 'node_modules')

      const env = {
        ...extensionNeedEnv,
        ...this._config.env,
        DANNN_EXTENSION_SERVER_PORT: this._port ?? '',
        DANNN_PROCESS_ID: String(this.id),
        DANNN_PROCESS_PID: String(this.pid),
        DANNN_PROCESS_PATH: normalize(this._path),
        DANNN_MODULES_PATH: normalize(process.env.DANNN_MODULES_PATH || nodeModulesRoot),
      }

      const iProcess = new Worker(join(__dirname, 'extension', 'extension-loader.js'), {
        env,
        // TODO: 这里希望使用 loader 来加载模块
        // execArgv: ['--loader', pathToFileURL(normalize(resolve(__dirname, 'loader.js'))).href],
        stdout: true,
        stderr: true,
      })

      // 绑定事件处理
      this.bindWorkerEvents(iProcess)

      ExtensionProcess.all.set(this.pid, { pid: this.pid, id: this.id, manifest })

      this.process = iProcess
    }
    catch (e) {
      throw new Error(`Failed to start extension: ${e}`)
    }
    finally {
      performance.mark('end-extension')
      performance.measure('extension', 'start-extension', 'end-extension')
    }
  }

  /**
   * 绑定 Worker 的事件处理
   * @param worker 子线程 Worker 实例
   */
  private bindWorkerEvents(worker: Worker): void {
    worker.on('exit', this.handleExit.bind(this))
    worker.on('error', this.handleError.bind(this))
    worker.on('message', this.handleMessage.bind(this))
    worker.on('online', this.handleOnline.bind(this))

    this.pipeOutput(worker)
  }

  /**
   * 处理 Worker 的退出事件
   * @param code 退出代码
   */
  private handleExit(code: number): void {
    logger.info(`Extension process exited with code ${code}`)
    ExtensionProcess.all.delete(this.pid)
  }

  /**
   * 处理 Worker 的错误事件
   * @param error 错误对象
   */
  private handleError(error: any): void {
    logger.error(`Extension process encountered an error: ${error?.message}`)
  }

  /**
   * 处理 Worker 的消息事件
   * @param message 消息内容
   */
  private handleMessage(message: BridgeRequest): void {
    this.onMessage(message)
  }

  send(data: BridgeRequest): void {
    if (this.process) {
      this.process.postMessage(data)
    }
    else {
      logger.error('Extension process is not running')
    }
  }

  /**
   * 处理 Worker 的上线事件
   */
  private handleOnline(): void {
    logger.log('Extension process is online')
  }

  /**
   * 将子线程的 stdout 和 stderr 集成到父进程的输出流中
   * @param worker 子线程 Worker 实例
   */
  private pipeOutput(worker: Worker): void {
    worker.stdout?.on('data', (data) => {
      process.stdout.write(`[Worker stdout]: ${data}`)
    })

    worker.stderr?.on('data', (data) => {
      process.stderr.write(`[Worker stderr]: ${data}`)
    })
  }

  /**
   * @description 关闭扩展进程
   */
  async close(): Promise<void> {
    // 关闭扩展进程之前先调用 deactivate 方法 最多五秒后执行开始关闭
    withTimeout(this.deactivate(), 5000)
      .finally(() => {
        if (this.process) {
          this.process.terminate()
          this.process = null
        }
        ExtensionProcess.all.delete(this.pid)
      })
  }
}
