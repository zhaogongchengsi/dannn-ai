import type { PackageJson } from 'pkg-types'
import type { Window } from '../lib/window'
import type { BridgeRequest } from '~/common/bridge'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { Worker } from 'node:worker_threads'
import { app } from 'electron'
import { join, normalize } from 'pathe'
import { Bridge } from '~/common/bridge'
import { logger } from '../lib/logger'

const configName = 'package.json'

export interface IExtensionProcessInfo {
  readonly pid: number
  readonly id: string
  readonly manifest: PackageJson
}

export interface IExtensionConfig {
  env: Record<string, string>
}

export class ExtensionProcess extends Bridge {
  private static ID_COUNTER = 0
  private readonly id = String(++ExtensionProcess.ID_COUNTER)
  private readonly pid = process.pid
  private static readonly all = new Map<number, IExtensionProcessInfo>()
  process: Worker | null = null
  manifest: PackageJson | null = null
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
  _window: Window

  constructor(path: string, window: Window, config: IExtensionConfig = { env: {} }) {
    super()
    this._path = path
    this._config = config
    this._window = window

    // 将win的所有的消息转发的扩展进程
    window.forwardTo(this, data => data.name.startsWith('window.'))
    // 将扩展进程的消息转发到win
    this.forwardTo(window, data => data.name.startsWith('extension.'))
  }

  getId(): string {
    return this.id
  }

  private async readManifest(): Promise<PackageJson> {
    const configFile = resolve(this._path, configName)
    if (!configFile.endsWith('.json') || !existsSync(configFile)) {
      throw new Error(`Config file ${configFile} does not exist or is not a JSON file`)
    }

    try {
      const value = await readFile(configFile, 'utf-8')
      this.manifest = JSON.parse(value) as PackageJson
      return this.manifest
    }
    catch (e) {
      throw new Error(`Failed to read config file ${configFile}: ${e}`)
    }
  }

  async start(): Promise<void> {
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

      const extensionNeedEnv = manifest?.permissions?.env ? Object.fromEntries(manifest.permissions.env.map((key: string) => [key, process.env[key]])) : {}

      if (!this.manifest) {
        throw new Error('Manifest is not defined')
      }

      const nodeModulesRoot = app.isPackaged ? app.getPath('exe') : resolve(app.getAppPath(), 'node_modules')

      const env = {
        ...extensionNeedEnv,
        ...this._config.env,
        DANNN_PROCESS_ID: String(this.id),
        DANNN_PROCESS_PID: String(this.pid),
        DANNN_PROCESS_PATH: normalize(this._path),
        DANNN_MODULES_PATH: normalize(process.env.DANNN_MODULES_PATH || nodeModulesRoot),
      }

      const iProcess = new Worker(join(__dirname, 'extension-loader.js'), {
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

  close(): void {
    if (this.process) {
      this.process.terminate()
      this.process = null
    }
    ExtensionProcess.all.delete(this.pid)
  }
}
