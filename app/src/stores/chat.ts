import type { CreateChatSchemas } from '@/lib/database/chatService'
import type { AIChat } from '@/lib/database/models'
import { createChat, findAllChats } from '@/lib/database/chatService'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useChatStore = defineStore('dannn-chat', () => {
  const chats = reactive<AIChat[]>([])

  async function init() {
    const allChat = await findAllChats()
    allChat.forEach((chat) => {
      chats.push(chat)
    })
  }

  async function addChat(chat: CreateChatSchemas) {
    const newChat = await createChat(chat)
    chats.push(newChat)
  }

  init()

  return {
    chats,
    addChat,
  }
})
