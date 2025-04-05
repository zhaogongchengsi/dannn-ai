import type { CreateChatSchemas, Room } from '@/lib/database/chatService'
import { sendToWorkerChannel } from '@/base/rxjs/channel'
import { useAppRx } from '@/base/rxjs/hook'
import { addAiMemberToChat, createAnswerMessage, createChat, createQuestionMessage, findAllChatsWithMessages, updateMessageContent } from '@/lib/database/chatService'
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { AIMessage } from '@/lib/database/models'
import { markdownToHtml } from '@/lib/shiki'

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

  function addMessageToChat(chat: string, message: AIMessage) {
    const chatRoom = rooms.find((room) => room.id === chat)
    if (chatRoom) {
      const index = chatRoom.messages.findIndex(msg => msg.sortId > message.sortId)
      if (index === -1) {
        chatRoom.messages.push(message)
      } else {
        chatRoom.messages.splice(index, 0, message)
      }
    } else {
      console.warn(`Chat with id ${chat} not found`)
    }
  }

  rx.onFormWorkerChannel(async (message) => {
    console.log('chat ', message)

    const chat = rooms.find(chat => chat.id === message.chatId)

    if (!chat) {
      console.warn(`Chat with id ${message.chatId} not found`)
      return
    }

    if (message.type === 'content') {
      const htmlMd = markdownToHtml(message.content)
      const newMessage = await createAnswerMessage(message.content, message.chatId, message.aiReplier, htmlMd)
      chat.lastMessageSortId = newMessage.sortId
      addMessageToChat(chat.id, newMessage)
    }

    if (message.type === 'stream') {
      const newMessage = await createAnswerMessage(message.content, message.chatId, message.aiReplier)
      chat.lastMessageSortId = newMessage.sortId
      const updatedMessage = await updateMessageContent(newMessage.id, message)
      addMessageToChat(chat.id, updatedMessage)
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
    addMessageToChat(chat.id, questionMessage)
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
