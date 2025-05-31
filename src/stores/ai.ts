import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useAIStore = defineStore('dannn-ai', () => {
  const ais = reactive<[]>([])

  function findAiById(id: number) {
    return ais.find(ai => ai.id === id)
  }

  return {
    ais,
    findAiById,
  }
})
