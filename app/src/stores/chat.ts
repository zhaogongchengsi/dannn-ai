import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useChatStore = defineStore('dannn-chat', () => {
  const rooms = reactive<[]>([])
  const currentChatID = ref<string | null>(null)

  return {
    rooms,
    currentChatID,
  }
})
