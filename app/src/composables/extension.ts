import { getExtensionsRoot } from '@/lib/api'
import { extensionSchema } from '@/lib/schema'
import { createGlobalState } from '@vueuse/core'
import { compact, template } from 'lodash'
import { join } from 'pathe'
import { ref } from 'vue'

const dannnConfigFile = 'dannn.json'

export interface ExtensionMeta extends Extension {
  readme?: string
  writable?: boolean
  available?: boolean
}

export const useExtension = createGlobalState(
  () => {
    const loading = ref(false)
    const extensions = ref<ExtensionMeta[]>([])

    async function init() {
      loading.value = true
      extensions.value = await scanAvailableExtensions().catch((error) => {
        console.error(`Error getting extensions: ${error}`)
        return []
      })
      loading.value = false
    }

    function findExtension(name: string) {
      return extensions.value.find(ext => ext.name === name)
    }

    return {
      loading,
      extensions,
      init,
      findExtension,
    }
  },
)

async function scanAvailableExtensions() {
  const root = await getExtensionsRoot()
  const extensions = await window.dannn.readDir(root)
  const availableExtensions: ExtensionMeta[] = []

  const cache = new Set<string>()

  const interpolate = /\{\{([\s\S]+?)\}\}/g

  for (const extension of extensions) {
    const pluginDir = join(root, extension)
    const configPath = join(pluginDir, dannnConfigFile)
    if (!await window.dannn.exists(configPath)) {
      continue
    }

    const config = await window.dannn.readFile(configPath).catch(() => undefined)

    if (!config) {
      availableExtensions.push({
        name: extension,
        available: false,
        writable: false,
        version: '0.0.0',
      })
      continue
    }

    const configValue: ExtensionMeta = JSON.parse(config)

    const { success } = extensionSchema.safeParse(configValue)

    if (!success) {
      availableExtensions.push({
        name: extension,
        available: false,
        writable: false,
        version: configValue?.version ?? '0.0.0',
      })
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

    if (cache.has(value.name)) {
      availableExtensions.splice(
        availableExtensions.findIndex(ext => ext.name === value.name),
        1,
      )
      continue
    }

    const readme = compact(await Promise.all(['README.md', 'README.MD', 'readme.md', 'readme.MD'].map(async (file) => {
      const readmePath = join(pluginDir, file)
      if (await window.dannn.exists(readmePath)) {
        return window.dannn.readFile(readmePath)
      }
      return undefined
    })).catch(() => []))

    value.readme = readme.at(0)

    availableExtensions.push(value)
  }

  return availableExtensions
}
