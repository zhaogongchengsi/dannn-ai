import type { CreateChatSchemas } from '@/lib/database/chatService'
import type { AIChat } from '@/lib/database/models'
import { createChat, findAllChats } from '@/lib/database/chatService'
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

export const useChatStore = defineStore('dannn-chat', () => {
  const chats = reactive<AIChat[]>([])
  const currentChatID = ref<string | null>(null)

  const currentChat = computed(() => {
    return chats.find(chat => chat.id === currentChatID.value) || null
  })

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

  async function setCurrentChatID(id: string | null) {
    currentChatID.value = id
  }

  init()

  return {
    chats,
    currentChat,
    currentChatID,
    addChat,
    setCurrentChatID,
  }
})
