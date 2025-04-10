import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useAIStore = defineStore('dannn-ai', () => {
  const ais = reactive<any[]>([])

  return {
    ais,
  }
})
