import type { Extension } from '../schemas/extension'
import type { CreateExtensionOptions } from '../types/extension'
import { compileWithTemplate } from '@/utils/template'
import { compact } from 'lodash'
import { join } from 'pathe'
import { z } from 'zod'
import { AI } from '../ai/ai'
import { InstallEvent } from '../common/install-event'
import { formatZodError } from '../common/zod'
import { DnWorker } from '../worker/worker'

export class DnExtension extends InstallEvent<Extension> {
  /**
   * 插件配置
   */
  config: Extension
  /**
   * 是否禁用
   */
  disabled: boolean

  /**
   * 插件介绍
   */
  readme: string
  options: CreateExtensionOptions
  id: string
  rawConfig: Extension
  dir: string
  dirname: string
  aihub: AI[] = []
  worker?: DnWorker

  constructor(config: Extension, options: CreateExtensionOptions) {
    super()
    this.rawConfig = config
    this.config = config
    this.dir = options.pluginDir
    this.dirname = options.dirname
    this.options = options
    this.disabled = false
    this.readme = ''
    this.id = this.generateId(config.name)

    if (!this.options.lazyLoad) {
      this.load()
    }
  }

  private generateId(name: string) {
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

  findAI(name: string) {
    return this.aihub.find(ai => ai.name === name)
  }

  async load() {
    const config = this.rawConfig

    // 触发加载前事件
    this.emit('status-changed', 'loading')

    try {
      const permissions = config.permission || {}
      let env = {}
      if (permissions.env) {
        env = await window.dannn.getEnv(permissions.env)
          .catch(() => ({} as Record<string, string>))
      }

      const compiled = compileWithTemplate(config, { process: { env }, self: config })

      this.config = compiled

      if (compiled.aiCollection) {
        compiled.aiCollection = compiled.aiCollection.map((aiConfig) => {
          const newConfig = { ...aiConfig, name: this.generateId(aiConfig.name) }
          const ai = new AI(newConfig)
          this.aihub.push(ai)
          return newConfig
        })
      }

      if (compiled.main) {
        const worker = new DnWorker(this.dirname, compiled.main)
        this.worker = worker
      }

      const readme = compact(await Promise.all(['README.md', 'README.MD', 'readme.md', 'readme.MD'].map(async (file) => {
        const readmePath = join(this.dir, file)
        if (await window.dannn.exists(readmePath)) {
          return window.dannn.readFile(readmePath)
        }
        return undefined
      })).catch(() => []))

      this.readme = readme.at(0) ?? ''

      // 触发加载成功事件
      this.emit('loaded', compiled)
      this.emit('status-changed', 'ready')
    }
    catch (err: any) {
      this.emit('load-error', err)
      this.emit('status-changed', 'error')
      if (err instanceof z.ZodError) {
        console.error('Zod validation errors:', formatZodError(err))
      }
    }
  }
}
