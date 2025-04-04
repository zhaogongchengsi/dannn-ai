import type { AIModel } from '@/lib/database/models'
import { onAIRegistered } from '@/base/rxjs/extensions'
import { findAllAIs } from '@/lib/database/aiService'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useAIStore = defineStore('dannn-ai', () => {
  const ais = reactive<AIModel[]>([])

  function addAIIfNotExists(ai: AIModel) {
    if (!ais.some(existingAI => existingAI.id === ai.id)) {
      ais.push(ai)
    }
  }

  async function init() {
    const ais = await findAllAIs()
    ais.forEach((ai) => {
      addAIIfNotExists(ai)
    })
  }

  init()

  onAIRegistered((ai) => {
    addAIIfNotExists(ai)
  })

  init()

  return {
    ais,
  }
})
