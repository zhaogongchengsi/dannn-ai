import type { AIModel } from '@/lib/database/models'
import { onAIRegistered } from '@/base/rxjs/extensions'
import { findAllAIs } from '@/lib/database/aiService'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useAIStore = defineStore('dannn-ai', () => {
  const ais = reactive<AIModel[]>([])

  async function init() {
    const ais = await findAllAIs()
    ais.forEach((ai) => {
      ais.push(ai)
    })
  }

  onAIRegistered((ai) => {
    console.log('AI registered:', ai)
  })

  init()

  return {
    ais,
  }
})
