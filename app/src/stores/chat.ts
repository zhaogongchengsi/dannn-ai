import type { CreateChatSchemas } from '@/lib/database/chatService'
import type { AIChat } from '@/lib/database/models'
import { addAiMemberToChat, createChat, findAllChats } from '@/lib/database/chatService'
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { useAIStore } from './ai'

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

  async function setAiToChat(id: string, aiId: string) {
    const chat = chats.find(chat => chat.id === id)
    if (chat?.participants.includes(aiId)) {
      console.warn(`AI member ${aiId} already exists in chat ${id}`)
      return
    }
    await addAiMemberToChat(id, aiId)
    if (chat) {
      chat.participants.push(aiId)
    }
  }

  init()

  return {
    chats,
    currentChat,
    currentChatID,
    addChat,
    setCurrentChatID,
    setAiToChat,
  }
})
