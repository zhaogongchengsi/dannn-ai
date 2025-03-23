import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

export const useConfigState = createGlobalState(
  () => {
    const config = ref<ConfigData>()
    const loading = ref(false)

    async function init() {
      loading.value = true
      const data = await window.dannn.ipc.invoke('config.get')
        .catch((error) => {
          console.error(`Error getting config: ${error}`)
          return undefined
        })
      loading.value = false
      config.value = data
    }

    function set(key: keyof ConfigData, value: ConfigData[keyof ConfigData]) {
      if (!config.value) {
        return
      }
      config.value = {
        ...config.value,
        [key]: value,
      }
      window.dannn.ipc.send('config.set', key, value)
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
    }
  },
)
