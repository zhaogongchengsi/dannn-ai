import type { AIModel } from '@/lib/database/models'
import type { AIConfig, Extension, ExtensionPermissions } from '@dannn/schemas'
import type { CreateExtensionOptions } from '../types/extension'
import { registerAI } from '@/lib/database/aiService'
import { compact, join } from 'lodash'
import { WorkerBridge } from './bridge'

export class ExtensionWorker extends WorkerBridge {
  name: string
  url: string
  version: string
  icon: string | undefined
  description: string | undefined
  id: string

  permissions: ExtensionPermissions | undefined
  dir: string
  dirname: string

  readme: string | undefined

  ais: AIModel[] = []

  constructor(config: Extension, options: CreateExtensionOptions) {
    super(config.name, config.main)
    this.dir = options.pluginDir
    this.dirname = options.dirname
    this.id = this.generateExtensionId(config.name)
    this.name = config.name
    this.url = config.main
    this.version = config.version
    this.icon = config.icon
    this.description = config.description
    this.permissions = config.permissions
    this.initReadme()
    this.expose('registerAI', async (ai: AIConfig) => {
      try {
        const aiConfig = await this.registerAI(ai)
        this.ais.push(aiConfig)
        this.emit('register-ai', aiConfig)
        return aiConfig
      }
      catch (e) {
        console.error('Error while registering AI:', e)
        throw e
      }
    })
    this.expose('getEnv', async (key: string) => {
      if (config.permissions && config.permissions.env && config.permissions.env.includes(key)) {
        const envs = await window.dannn.getEnv([key])
        if (envs[key]) {
          return envs[key]
        }
        throw new Error(`Env key ${key} not found`)
      }
      throw new Error(`Permission denied to access env key: ${key}`)
    })
  }

  private generateExtensionId(name: string) {
    const normalized = name
      .toLowerCase()
      // 替换连续非字母数字字符为单个连字符
      .replace(/[^a-z0-9]+/g, '-')
      // 移除首尾连字符
      .replace(/^-+|-+$/g, '')
      // 截断至合理长度
      .slice(0, 50)
    return normalized
  }

  private async initReadme() {
    const readme = compact(await Promise.all(['README.md', 'README.MD', 'readme.md', 'readme.MD'].map(async (file) => {
      const readmePath = join(this.dir, file)
      if (await window.dannn.exists(readmePath)) {
        return window.dannn.readFile(readmePath)
      }
      return undefined
    })).catch(() => []))
    this.readme = readme.join('\n')
  }

  async activate() {
    if (this.isReady) {
      await this.isReady?.promise
    }
    return await this.invoke<void>('activate')
  }

  async registerAI(ai: AIConfig): Promise<AIModel> {
    return await registerAI(ai)
  }

  destroy() {
    this.terminate()
  }
}
