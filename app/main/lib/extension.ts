import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { Worker } from 'node:worker_threads'
import { z } from 'zod'

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
      const manifest = await this.readManifest()
      const mainFile = resolve(this._path, manifest.main)
      if (!existsSync(mainFile)) {
        throw new Error(`Main file ${mainFile} does not exist`)
      }

      const extensionNeedEnv = manifest?.permissions?.env ? Object.fromEntries(manifest.permissions.env.map(key => [key, process.env[key]])) : {}
      const env = { ...extensionNeedEnv, ...this._config.env }

      const iProcess = new Worker(mainFile, {
        env,
        stdout: true,
        stderr: true,
      })

      iProcess.on('exit', (code) => {
        // eslint-disable-next-line no-console
        console.log(`Extension process exited with code ${code}`)
        ExtensionProcess.all.delete(this.pid)
      })

      iProcess.on('error', (error: any) => {
        console.error(`Extension process encountered an error: ${error?.message}`)
      })

      iProcess.on('message', (message) => {
        // eslint-disable-next-line no-console
        console.log(`Message from extension process: ${message}`)
      })

      ExtensionProcess.all.set(this.pid, { pid: this.pid, id: this.id, manifest })

      this.process = iProcess
    }
    catch (e) {
      throw new Error(`Failed to start extension: ${e}`)
    }
  }

  close(): void {
    if (this.process) {
      this.process.terminate()
      this.process = null
    }
    ExtensionProcess.all.delete(this.pid)
  }
}
