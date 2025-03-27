import { getExtensionsRoot } from '@/lib/api'
import { createGlobalState } from '@vueuse/core'
import { join } from 'pathe'
import { ref } from 'vue'
import { template } from 'lodash'

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

  const interpolate = /{{([\s\S]+?)}}/g

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

    const configValue: Extension = JSON.parse(config)

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

  console.log(availableExtensions)

  return availableExtensions
}
