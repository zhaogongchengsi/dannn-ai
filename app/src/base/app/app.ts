import type { Extension } from '../schemas/extension'
import type { AppEvents } from '../types/app'
import { getExtensionsRoot } from '@/lib/api'
import { join } from 'pathe'
import { DnEvent } from '../common/event'
import { formatZodError } from '../common/zod'
import { DnExtension } from '../extension'
import { extensionSchema } from '../schemas/extension'

const dannnConfigFile = 'dannn.json'

export class DnApp extends DnEvent<AppEvents> {
  private static instance: DnApp | null = null
  public extensions: DnExtension[] = []
  private constructor() {
    super()
  }

  public static getInstance(): DnApp {
    if (this.instance === null) {
      this.instance = new DnApp()
    }
    return this.instance
  }

  public init() {
    this.emit('app:ready', undefined)
    this.loadLocalExtensions()
  }

  findExtension(id: string) {
    return this.extensions.find(ext => ext.id === id)
  }

  getExtensions() {
    return this.extensions
  }

  async loadLocalExtensions() {
    const root = await getExtensionsRoot()
    const extensions = await window.dannn.readDir(root)
    extensions.forEach(async (extension) => {
      try {
        const pluginDir = join(root, extension)
        const configPath = join(pluginDir, dannnConfigFile)

        if (!await window.dannn.exists(configPath)) {
          return
        }

        const config = await window.dannn.readFile(configPath).catch(() => {
          return undefined
        })

        if (!config) {
          return
        }

        const configValue: Extension = JSON.parse(config)

        const { success, data, error } = extensionSchema.safeParse(configValue)

        if (!success) {
          console.error('Invalid extension config:', formatZodError(error))
          this.emit('app:load-error', {
            name: extension,
            error: formatZodError(error),
          })
          return
        }

        const dnExtension = new DnExtension(data, { pluginDir, dirname: extension })
        dnExtension.once('loaded', () => {
          this.extensions.push(dnExtension)
          this.emit('app:load-extension', dnExtension)
        })
      }
      catch (error) {
        console.error('Error loading extension:', error)
      }
    })
  }
}
