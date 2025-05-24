import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'
import { dirname } from 'pathe'
import { z } from 'zod'
import { logger } from './logger'

export const PluginManifestSchema = z.object({
  name: z.string().regex(/^[^\s!@#$%^&*()+=[\]{};':"\\|,.<>/?]*$/, { message: 'Name cannot contain illegal characters or spaces' }),
  version: z.string(),
  icon: z.string().url().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  homepage: z.string().url().optional(),
  // 可以进一步约束为以 './' 开头并以 '.js' 或 '.cjs' 结尾的路径
  main: z.string().regex(/^\.\/.*\.(js|cjs)$/, { message: 'Must start with \'./\' and end with \'.js\' or \'.cjs\'' }),
  permissions: z.object({
    env: z.array(z.string()).optional(),
  }).optional(),
})

const configName = 'dannn.json'

// 如果你要推导类型
export type PluginManifest = z.infer<typeof PluginManifestSchema>

export interface IExtensionProcessInfo {
  readonly pid: number
  readonly id: string
  readonly manifest: PluginManifest
}

export interface IExtensionConfig {
  env: Record<string, string>
}

const _dirname = dirname(fileURLToPath(import.meta.url))

export class ExtensionProcess {
  private static ID_COUNTER = 0
  private readonly id = String(++ExtensionProcess.ID_COUNTER)
  private readonly pid = process.pid
  private static readonly all = new Map<number, IExtensionProcessInfo>()
  process: Worker | null = null
  manifest: PluginManifest | null = null
  static getAll(): IExtensionProcessInfo[] {
    return Array.from(ExtensionProcess.all.values())
  }

  static getById(id: number): IExtensionProcessInfo | undefined {
    return ExtensionProcess.all.get(id)
  }

  _path: string
  _config: IExtensionConfig

  constructor(path: string, config: IExtensionConfig) {
    this._path = path
    this._config = config
  }

  private async readManifest(): Promise<PluginManifest> {
    const configFile = resolve(this._path, configName)
    if (!configFile.endsWith('.json') || !existsSync(configFile)) {
      throw new Error(`Config file ${configFile} does not exist or is not a JSON file`)
    }

    try {
      const value = await readFile(configFile, 'utf-8')

      const { success, data, error } = PluginManifestSchema.safeParse(JSON.parse(value))

      if (!success) {
        throw new Error(`Invalid config file ${configFile}: ${error}`)
      }

      this.manifest = data

      return data
    }
    catch (e) {
      throw new Error(`Failed to read config file ${configFile}: ${e}`)
    }
  }

  async start(): Promise<void> {
    try {
      performance.mark('start-extension')
      const manifest = await this.readManifest()
      const mainFile = resolve(this._path, manifest.main)
      if (!existsSync(mainFile)) {
        throw new Error(`Main file ${mainFile} does not exist`)
      }

      const extensionNeedEnv = manifest?.permissions?.env ? Object.fromEntries(manifest.permissions.env.map(key => [key, process.env[key]])) : {}

      if (!this.manifest) {
        throw new Error('Manifest is not defined')
      }

      const env = {
        ...extensionNeedEnv,
        ...this._config.env,
        DANNN_PROCESS_ID: String(this.id),
        DANNN_PROCESS_PID: String(this.pid),
        DANNN_PROCESS_PATH: this.manifest.name.toLowerCase(),
      }

      const iProcess = new Worker(mainFile, {
        env,
        // execArgv: ['--loader', pathToFileURL(normalize(resolve(_dirname, './loader.mjs'))).href],
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
  private handleMessage(message: any): void {
    logger.log(`Message from extension process: ${message}`)
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
