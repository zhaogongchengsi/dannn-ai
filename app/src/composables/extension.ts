import { getExtensionsRoot } from '@/lib/api'
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
      const root = await getExtensionsRoot()
      const extensions = await window.dannn.readDir(root)
      console.log('extensions', extensions)
      console.log('root', root)

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
