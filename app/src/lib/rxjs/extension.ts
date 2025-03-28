import type { ExtensionMeta } from '../schemas/extension'
import { compact, template } from 'lodash'
import { join } from 'pathe'
import { Subject } from 'rxjs/internal/Subject'
import { getExtensionsRoot } from '../api'
import { extensionSchema } from '../schemas/extension'

const interpolate = /\{\{([\s\S]+?)\}\}/g
const dannnConfigFile = 'dannn.json'

class ExtensionSubject extends Subject<ExtensionMeta> {
  extensions: ExtensionMeta[] = []
  completed: boolean = false
  constructor() {
    super()
    this.subscribe({
      next: (value) => {
        this.extensions.push(value)
      },
      complete: () => {
        this.completed = true
      },
    })
  }

  extension(name: string) {
    return this.extensions.find(ext => ext.name === name)
  }

  async loadExtensions() {
    const root = await getExtensionsRoot()
    const extensions = await window.dannn.readDir(root)
    for (const extension of extensions) {
      const pluginDir = join(root, extension)
      const configPath = join(pluginDir, dannnConfigFile)
      if (!await window.dannn.exists(configPath)) {
        continue
      }

      const config = await window.dannn.readFile(configPath).catch(() => {
        this.error(new Error(`Error reading config for ${extension}`))
        return undefined
      })

      if (!config) {
        this.error(new Error(`Error reading config for ${extension}`))
        continue
      }

      const configValue: ExtensionMeta = JSON.parse(config)

      const { success, error } = extensionSchema.safeParse(configValue)

      if (!success) {
        this.error(new Error(`Error parsing config for ${extension}: ${error}`))
        continue
      }

      const permissions = configValue.permission || {}
      let env = {}
      if (permissions.env) {
        env = await window.dannn.getEnv(permissions.env)
          .catch(() => ({} as Record<string, string>))
      }

      const compiled = template(config, { interpolate })

      let value = configValue
      try {
        value = JSON.parse(compiled({ this: JSON.parse(config), process: { env } }))
      }
      catch (error) {
        console.error(`Error compiling config for ${extension}: ${error}`)
      }

      const readme = compact(await Promise.all(['README.md', 'README.MD', 'readme.md', 'readme.MD'].map(async (file) => {
        const readmePath = join(pluginDir, file)
        if (await window.dannn.exists(readmePath)) {
          return window.dannn.readFile(readmePath)
        }
        return undefined
      })).catch(() => []))

      value.readme = readme.at(0)

      this.next(value)
    }

    this.complete()
  }
}

export const extensionSubject = new ExtensionSubject()
