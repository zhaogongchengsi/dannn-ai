import type { z } from 'zod'
import type { Extension } from './schemas/extension'
import { generatePluginId } from '@/utils/plugin-id'
import { compileWithTemplate } from '@/utils/template'
import { compact } from 'lodash'
import { join } from 'pathe'
import { ReplaySubject } from 'rxjs/internal/ReplaySubject'
import { getExtensionsRoot } from './api'
import { extensionSchema } from './schemas/extension'
import { DannnEvent } from './event'

const dannnConfigFile = 'dannn.json'

type PluginStatus = 'inactive' | 'loading' | 'active' | 'error' | 'reloading'

export interface PluginRecord {
  id: string
  manifest: Extension
  status: PluginStatus
  subject: ReplaySubject<PluginEvent>
  cleanup?: () => Promise<void>
  metadata: PluginMetadata
}

export interface PluginMetadata {
  id: string
  manifest: Extension
  uri: string
  readme?: string | undefined
}

export type PluginEvent =
  | { type: 'registered', plugin: PluginMetadata }
  | { type: 'unregistered', pluginId: string }
  | { type: 'status-changed', status: PluginStatus }
  | { type: 'config-updated', changes: Partial<PluginMetadata> }
  | { type: 'error', error: Error }

export interface PluginEvents {
  registered: PluginMetadata
  unregistered: string
  'status-changed': PluginStatus
  'config-updated': Partial<PluginMetadata>
  error: Error
}

export class DannnPlugin extends DannnEvent<PluginEvents> {
  private static instance: DannnPlugin
  private plugins = new Map<string, PluginRecord>()
  static getInstance() {
    return this.instance ??= new DannnPlugin()
  }

  private formatZodError(error: z.ZodError) {
    return error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      expected: issue.code === 'invalid_type'
        ? issue.expected
        : undefined,
      received: issue.code === 'invalid_type'
        ? issue.received
        : undefined,
    }))
  }

  private async initPlugin(record: PluginRecord) {
    record.status = 'active'
    this.emitEvent(record.id, {
      type: 'status-changed',
      status: 'active',
    })
  }

  async register(manifest: Extension, pluginUri: string) {
    const { success, data, error } = extensionSchema.safeParse(manifest)
    if (!success) {
      const errorDetails = this.formatZodError(error)
      throw new PluginValidationError(
        'Invalid plugin configuration',
        errorDetails,
      )
    }
    const pluginId = generatePluginId(data.name, data.author)

    if (this.plugins.has(pluginId)) {
      return pluginId
    }

    const permissions = data.permission || {}
    let env = {}
    if (permissions.env) {
      env = await window.dannn.getEnv(permissions.env)
        .catch(() => ({} as Record<string, string>))
    }

    const compiled = compileWithTemplate(data, { process: { env }, self: data })

    const readme = compact(await Promise.all(['README.md', 'README.MD', 'readme.md', 'readme.MD'].map(async (file) => {
      const readmePath = join(pluginUri, file)
      if (await window.dannn.exists(readmePath)) {
        return window.dannn.readFile(readmePath)
      }
      return undefined
    })).catch(() => []))

    const metadata: PluginMetadata = {
      manifest: compiled,
      id: pluginId,
      uri: pluginUri,
      readme: readme.at(0),
    }

    const record: PluginRecord = {
      id: pluginId,
      manifest: compiled,
      status: 'loading',
      metadata,
      subject: new ReplaySubject<PluginEvent>(1),
    }

    try {
      await this.initPlugin(record)
      this.plugins.set(record.id, record)
      this.emit('registered', record.metadata)
      return pluginId
    }
    catch (err: any) {
      record.status = 'error'

      this.emitEvent(pluginId, {
        type: 'error',
        error: err instanceof Error ? err : new Error(String(err)),
      })

      this.plugins.delete(pluginId)
      throw err
    }
  }

  private emitEvent(pluginId: string, event: PluginEvent) {
    const record = this.plugins.get(pluginId)
    if (!record)
      return

    // 同时发送到插件专属总线和全局总线
    record.subject.next(event)
  }


  async unregister(pluginId: string) {
    const record = this.plugins.get(pluginId)
    if (!record)
      return false
    // 触发卸载前事件
    this.emitEvent(pluginId, {
      type: 'status-changed',
      status: 'inactive',
    })

    try {
      await record.cleanup?.()
    }
    catch (err) {
      console.error(`Error during plugin cleanup: ${err}`)
    }

    // 移除引用
    record.subject.complete()
    this.plugins.delete(pluginId)

    // 发送卸载事件
    this.emit('unregistered', pluginId)

    return true
  }

  getPlugin(pluginId: string) {
    return this.plugins.get(pluginId)
  }

  getPluginMetadata(pluginId: string) {
    return this.plugins.get(pluginId)?.metadata
  }

  getPlugins() {
    return Array.from(this.plugins.values())
  }

  async loadLocalExtensions() {
    const root = await getExtensionsRoot()
    const extensions = await window.dannn.readDir(root)
    for (const extension of extensions) {
      const pluginDir = join(root, extension)
      const configPath = join(pluginDir, dannnConfigFile)
      if (!await window.dannn.exists(configPath)) {
        continue
      }

      const config = await window.dannn.readFile(configPath).catch(() => {
        return undefined
      })

      if (!config) {
        continue
      }

      const configValue: Extension = JSON.parse(config)

      this.register(configValue, pluginDir)
        .catch((error) => {
          this.emitEvent(configValue.name, {
            type: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
          })
        })
    }
  }
}

// src/errors/plugin-errors.ts
export class PluginValidationError extends Error {
  public readonly details: Array<{
    path: string
    message: string
    expected?: string
    received?: string
  }>

  constructor(
    message: string,
    details: ReturnType<DannnPlugin['formatZodError']>,
  ) {
    super(message)
    this.name = 'PluginValidationError'
    this.details = details
  }

  // 生成用户友好报告
  toUserReport() {
    return {
      title: '插件配置错误',
      sections: this.details.map(d => ({
        field: d.path || '根配置',
        problem: d.message,
        solution: d.expected
          ? `应提供 ${d.expected} 类型，但收到 ${d.received}`
          : '请检查配置格式',
      })),
    }
  }
}

export const dannnPlugin = DannnPlugin.getInstance()
