import type { AIData } from '@/common/types'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { getAllAIs } from '@/base/api/ai'

export const useAIStore = defineStore('dannn-ai', () => {
  const ais = reactive<AIData[]>([])

  getAllAIs().then((data) => {
    ais.push(...data)
  })

  function findAiById(id: number) {
    return ais.find(ai => ai.id === id)
  }

  return {
    ais,
    findAiById,
  }
})
