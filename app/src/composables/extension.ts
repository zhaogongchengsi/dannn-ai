import type { ExtensionMeta } from '@/lib/schemas/extension'
import { extensionSubject } from '@/lib/rxjs/extension'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExtension = defineStore('dannn-extension', () => {
  const extensions = ref<ExtensionMeta[]>([])
  extensionSubject.subscribe({
    error(err) {},
    next(value) {
      extensions.value = [...extensions.value, value]
    },
    complete() {
      extensions.value = extensions.value.sort((a, b) => a.name.localeCompare(b.name))
    },
  })

  function findExtension(name: string) {
    return extensions.value.find(ext => ext.name === name)
  }

  return {
    extensions,
    findExtension,
  }
})
