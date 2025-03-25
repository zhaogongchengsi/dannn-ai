import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

export const useExtension = createGlobalState(
  () => {
    const loading = ref(false)
    const extensions = ref<Extension[]>([])
    const extensionsLoadings = ref<Record<string, boolean>>({})
    const extensionsErrors = ref<Record<string, string>>({})
    const extensionsInstances = ref<Record<string, any>>({})

    async function init() {
      loading.value = true
      const data = await window.dannn.ipc.invoke<Extension[]>('extensions.get')
        .catch((error) => {
          console.error(`Error getting extensions: ${error}`)
          return []
        })
      loading.value = false
      extensions.value = data
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
