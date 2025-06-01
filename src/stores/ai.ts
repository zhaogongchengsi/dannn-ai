import type { InfoAI } from '~/node/database/service/ai'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { database } from '@/lib/database'

export const useAIStore = defineStore('dannn-ai', () => {
  const ais = reactive<InfoAI[]>([])

  database.ai.getAllAis().then((fetchedAis) => {
    ais.push(...fetchedAis)
  })

  function findAiById(id: number) {
    return ais.find(ai => ai.id === id)
  }

  return {
    ais,
    findAiById,
  }
})
