import { extensionObservable } from '@/lib/rxjs/extension'
import type { ExtensionMeta } from '@/lib/schemas/extension'
import { defineStore } from 'pinia'

import { ref } from 'vue'

export const useExtension = defineStore('dannn-extension', () => {
  const extensions = ref<ExtensionMeta[]>([])
	extensionObservable.subscribe({
		error(err) {},
		next(value) {
			extensions.value = [...extensions.value, value]
		},
		complete() {
			extensions.value = extensions.value.sort((a, b) => a.name.localeCompare(b.name))
		},
	})



	function findExtension(name: string) {
		return extensions.value.find((ext) => ext.name === name)
	}


  return {
    extensions,
	  findExtension,
  }
})
