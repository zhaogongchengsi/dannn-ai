import { getExtensionsRoot } from '@/lib/api'
import { createGlobalState } from '@vueuse/core'
import { join } from 'pathe'
import { ref } from 'vue'
import { template } from 'lodash'
import { extensionSchema } from '@/utils/schema'

const dannnConfigFile = 'dannn.json'

export const useExtension = createGlobalState(
  () => {
    const loading = ref(false)
    const extensions = ref<Extension[]>([])
    const extensionsErrors = ref<Record<string, any>>({})

    async function init() {
      loading.value = true
      const extensionInfo = await scanAvailableExtensions().catch((error) => {
        console.error(`Error getting extensions: ${error}`)
        return { extensions: [], errors: [] }
      })
      extensions.value = extensionInfo.extensions
      extensionsErrors.value = extensionInfo.errors
      loading.value = false
    }

    return {
      loading,
      extensions,
      extensionsErrors,
      init,
    }
  },
)

async function scanAvailableExtensions() {
  const root = await getExtensionsRoot()
  const extensions = await window.dannn.readDir(root)
  const availableExtensions: Extension[] = []
  const errors :Record<string, any>[] = []

  const cache = new Set<string>()

  const interpolate = /{{([\s\S]+?)}}/g

  for (const extension of extensions) {
    const pluginDir = join(root, extension)
    const configPath = join(pluginDir, dannnConfigFile)
    if (!await window.dannn.exists(configPath)) {
      continue
    }

    const config = await window.dannn.readFile(configPath).catch(() => undefined)

    if (!config) {
      errors.push({
        name: extension,
        error: 'Error reading config file',
      })
      continue
    }

    const configValue: Extension = JSON.parse(config)

    const { success, error } = extensionSchema.safeParse(configValue)

    if (!success) {
      errors.push({
        name: extension,
        error: error,
      })
      continue
    }

    const permissions = configValue.permissions || {}
    let env = {}
    if (permissions.env) {
      env = await window.dannn.getEnv(permissions.env)
    }

    const compiled = template(config, { interpolate })

    const value = JSON.parse(compiled({ this: JSON.parse(config), process: { env } }))

    if (cache.has(value.name)) {
      availableExtensions.splice(
        availableExtensions.findIndex(ext => ext.name === value.name),
        1,
      )
      continue
    }

    availableExtensions.push(value)
  }

  return {
    extensions: availableExtensions,
    errors
  }
}
