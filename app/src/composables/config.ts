import { createGlobalState, useColorMode } from '@vueuse/core'
import { ref } from 'vue'

export const useConfig = createGlobalState(
  () => {
    const config = ref<ConfigData>()
    const loading = ref(false)
    const mode = useColorMode()

    async function init() {
      loading.value = true
      const data = await window.dannn.ipc.invoke<ConfigData>('config.get')
        .catch((error) => {
          console.error(`Error getting config: ${error}`)
          return undefined
        })
        .finally(() => {
          loading.value = false
        })

      if (!data) {
        return
      }
      config.value = data
      mode.value = data.theme
    }

    function set<K extends keyof ConfigData>(key: K, value: ConfigData[K]) {
      if (!config.value) {
        return
      }
      config.value = {
        ...config.value,
        [key]: value,
      }

      window.dannn.ipc.invoke('config.set', key, value)
    }

    function get(key: keyof ConfigData) {
      if (!config.value) {
        return
      }
      return config.value[key]
    }

    return {
      config,
      set,
      get,
      loading,
      init,
      mode,
    }
  },
)
