import type { AIData } from 'common/types'
import { getAllAIs } from 'base/ai'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useAIStore = defineStore('dannn-ai', () => {
  const ais = reactive<AIData[]>([])

  getAllAIs().then((data) => {
    ais.push(...data)
  })

  return {
    ais,
  }
})
