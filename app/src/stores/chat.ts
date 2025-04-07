import type { CreateChatSchemas, Room } from '@/lib/database/chatService'
import type { AIMessage, ID } from '@/lib/database/models'
import type { Reactive } from 'vue'
import { sendQuestionToWorker } from '@/base/rxjs/channel'
import { useAppRx } from '@/base/rxjs/hook'
import { addAiMemberToChat, createAnswerMessage, createChat, createQuestionMessage, findAllChatsWithMessages, findMessageById, updateStreamMessageContent } from '@/lib/database/chatService'
import { markdownToHtml } from '@/lib/shiki'
import { defineStore } from 'pinia'
import { computed, reactive, ref, toValue } from 'vue'

export const useChatStore = defineStore('dannn-chat', () => {
  const rx = useAppRx()

  const rooms = reactive<Map<string, Reactive<Room>>>(new Map())
  const currentChatID = ref<string | null>(null)

  const currentChat = computed(() => {
    if (currentChatID.value) {
      return toValue(rooms.get(currentChatID.value)) || null
    }
    return null
  })

  async function init() {
    const allChat = await findAllChatsWithMessages()
    allChat.forEach((chat) => {
      rooms.set(chat.id, reactive(chat))
    })
  }

  init()

  function getChatById(id: string) {
    return rooms.get(id)
  }

  function updateMessageChat(chat: string, message: AIMessage) {
    const chatRoom = getChatById(chat)
    if (chatRoom) {
      const index = chatRoom.messages.findLastIndex(msg => msg.id === message.id)
      if (index === -1) {
        /**
         * 查看是否有消息是否应该插入到最后一个
         */
        const preMessage = chatRoom.messages.findLastIndex(msg => msg.sortId === message.sortId + 1)
        if (preMessage === -1) {
          chatRoom.messages.push(message)
          chatRoom.lastMessageSortId = message.sortId
        }
        else {
          chatRoom.messages = chatRoom.messages.toSpliced(preMessage, 1, message)
        }
      }
      else {
        chatRoom.messages = chatRoom.messages.toSpliced(index, 1, message)
      }
    }
    else {
      console.warn(`Chat with id ${chat} not found`)
    }
  }

  rx.subscribeToWorkerAnswers(async (message) => {
    console.log('onFormWorkerChannel', message)

    const chat = getChatById(message.chatId)

    if (!chat) {
      console.warn(`Chat with id ${message.chatId} not found`)
      return
    }

    if (message.type === 'content') {
      const htmlMd = markdownToHtml(message.content)
      const newMessage = await createAnswerMessage(message.content, message.chatId, message.aiReplier, htmlMd)
      chat.lastMessageSortId = newMessage.sortId
      updateMessageChat(chat.id, newMessage)
    }

    if (message.type === 'stream') {
      // BUG: 这里的 message 是一个流式消息，应该是一个数组 会导致重复创建消息
      const existMessage = await findMessageById(message.id).catch(() => null)

      if (existMessage) {
        chat.lastMessageSortId = chat.lastMessageSortId > existMessage.sortId ? chat.lastMessageSortId : existMessage.sortId
        const updatedMessage = await updateStreamMessageContent(existMessage.id, message)
        updateMessageChat(chat.id, updatedMessage)
        return
      }

      const newMessage = await createAnswerMessage(message.content, message.chatId, message.aiReplier, undefined, message.id as ID)
      chat.lastMessageSortId = newMessage.sortId
      const updatedMessage = await updateStreamMessageContent(newMessage.id, message)
      updateMessageChat(chat.id, updatedMessage)
    }
  })

  async function addChat(chat: CreateChatSchemas) {
    const newChat = await createChat(chat)
    rooms.set(newChat.id, reactive({
      ...newChat,
      messages: [],
    }))
  }

  async function setCurrentChatID(id: string | null) {
    currentChatID.value = id
  }

  async function setAiToChat(id: string, aiId: string) {
    const chat = getChatById(id)
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
    const chat = chatID ? getChatById(chatID) : currentChat.value
    if (!chat) {
      throw new Error(`Chat with id ${chatID} not found`)
    }
    const questionMessage = await createQuestionMessage(question, chat.id)
    sendQuestionToWorker({
      id: questionMessage.id,
      chatId: chat.id,
      content: questionMessage.content,
      aiReplier: [...chat.participants],
    })
    updateMessageChat(chat.id, questionMessage)
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
