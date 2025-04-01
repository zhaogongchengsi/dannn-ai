import type { ExtensionNeedModule } from '@dannn/types'
import type { Extension, ExtensionPermissions } from '../schemas/extension'
import type { CreateExtensionOptions } from '../types/extension'
import { compact, join } from 'lodash'
import { filter, ReplaySubject } from 'rxjs'
import { WorkerBridge } from './bridge'

export class ExtensionWorker extends WorkerBridge {
  name: string
  url: string
  version: string
  icon: string | undefined
  description: string | undefined
  id: string

  permissions: ExtensionPermissions | undefined
  env: Record<string, string> = {}
  dir: string
  dirname: string

  readme: string | undefined

  ready$ = new ReplaySubject<boolean>(1)

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
    this.initReadme()
    this.toMessageObservable().pipe(filter(message => message.type === 'done')).subscribe(async () => {
      await this.initEnv(config.permissions)
      await this.activate()
      this.ready$.next(true)
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

  private async initEnv(permissions?: ExtensionPermissions) {
    if (!permissions?.env) {
      return {}
    }
    return await window.dannn.getEnv(permissions.env)
      .catch(() => ({} as Record<string, string>))
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
    if (!this.isReady) {
      this.donePromiser = Promise.withResolvers<void>()
      return await this.donePromiser.promise
    }
    else {
      return await this.invoke<void>('activate')
    }
  }

  destroy() {
    this.postMessage({
      type: 'destroy',
    })
    this.donePromiser?.resolve()
    this.donePromiser = null
    this.subject.complete()
  }

  implementation(module: ExtensionNeedModule) {
    Object.keys(module).forEach((key) => {
      this.expose(key, module[key as keyof ExtensionNeedModule])
    })
  }

  sidebarReady() {
    this.ready$.subscribe(() => {
      this.emitToWorker('sidebar-ready')
    })
  }
}
