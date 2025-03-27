import { getExtensionsRoot } from '@/lib/api'
import { createGlobalState } from '@vueuse/core'
import { join } from 'pathe'
import { ref } from 'vue'

const dannnConfigFile = 'dannn.json'

export const useExtension = createGlobalState(
  () => {
    const loading = ref(false)
    const extensions = ref<Extension[]>([])
    const extensionsLoadings = ref<Record<string, boolean>>({})
    const extensionsErrors = ref<Record<string, string>>({})
    const extensionsInstances = ref<Record<string, any>>({})

    async function init() {
      loading.value = true
      extensions.value = await scanAvailableExtensions().catch((error) => {
        console.error(`Error getting extensions: ${error}`)
        return []
      })
      loading.value = false
    }

    return {
      loading,
      extensions,
      extensionsLoadings,
      extensionsErrors,
      extensionsInstances,
      init,
    }
  },
)

async function scanAvailableExtensions() {
  const root = await getExtensionsRoot()
  const extensions = await window.dannn.readDir(root)
  const availableExtensions: Extension[] = []

  const cache = new Set<string>()

  for (const extension of extensions) {
    const pluginDir = join(root, extension)
    const configPath = join(pluginDir, dannnConfigFile)
    if (!await window.dannn.exists(configPath)) {
      continue
    }

    const config = await window.dannn.readFile(configPath).catch(() => undefined)

    if (!config) {
      continue
    }

    // const ok = await window.dannn.validate(config).catch(() => false)

    // if (!ok) {
    //   continue
    // }

    const configValue = JSON.parse(config)

    if (cache.has(configValue.name)) {
      availableExtensions.splice(
        availableExtensions.findIndex(ext => ext.name === configValue.name),
        1,
      )
      continue
    }

    availableExtensions.push(configValue)
  }

  return availableExtensions
}
