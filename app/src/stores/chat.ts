import type { CreateChatSchemas, Room } from '@/lib/database/chatService'
import { sendToWorkerChannel } from '@/base/rxjs/channel'
import { useAppRx } from '@/base/rxjs/hook'
import { addAiMemberToChat, createAnswerMessage, createChat, createQuestionMessage, findAllChatsWithMessages } from '@/lib/database/chatService'
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

export const useChatStore = defineStore('dannn-chat', () => {
  const rx = useAppRx()

  const rooms = reactive<Room[]>([])
  const currentChatID = ref<string | null>(null)

  const currentChat = computed(() => {
    return rooms.find(chat => chat.id === currentChatID.value) || null
  })

  async function init() {
    const allChat = await findAllChatsWithMessages()
    allChat.forEach((chat) => {
      rooms.push(chat)
    })
  }

  init()

  rx.onFormWorkerChannel(async (message) => {
    console.log('chat ', message)
    if (message.type === 'content') {
      const newMessage = await createAnswerMessage(message.content, message.chatId, message.aiReplier)
      const chat = rooms.find(chat => chat.id === message.chatId)
      if (chat) {
        chat.messages.push(newMessage)
        chat.lastMessageSortId = newMessage.sortId
      }
    }
  })

  async function addChat(chat: CreateChatSchemas) {
    const newChat = await createChat(chat)
    rooms.push({
      ...newChat,
      messages: [],
    })
  }

  async function setCurrentChatID(id: string | null) {
    currentChatID.value = id
  }

  async function setAiToChat(id: string, aiId: string) {
    const chat = rooms.find(chat => chat.id === id)
    if (chat?.participants.includes(aiId)) {
      console.warn(`AI member ${aiId} already exists in chat ${id}`)
      return
    }
    await addAiMemberToChat(id, aiId)
    if (chat) {
      chat.participants.push(aiId)
    }
  }

  async function question(question: string, chatID?: string) {
    const chat = chatID ? rooms.find(chat => chat.id === chatID) : currentChat.value
    if (!chat) {
      throw new Error(`Chat with id ${chatID} not found`)
    }
    const questionMessage = await createQuestionMessage(question, chat.id)
    sendToWorkerChannel({
      id: questionMessage.id,
      chatId: chat.id,
      content: questionMessage.content,
      aiReplier: [...chat.participants],
    })
  }

  return {
    rooms,
    currentChat,
    currentChatID,
    addChat,
    setCurrentChatID,
    setAiToChat,
    question,
  }
})
