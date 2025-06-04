import type { QuestionContext } from '@/common/schema'
import type { InfoAI } from '@/node/database/service/ai'
import type { InfoMessage } from '@/node/database/service/message'
import type { ThinkingMessage } from '@/stores/messages'
import type { InfoChat, InsertChat } from '~/node/database/service/room'
import { defineStore } from 'pinia'
import { database } from '@/lib/database'
import { broadcast, onAiEndThink, onAiThinking } from '@/lib/extension'

export interface ChatItem extends InfoChat {
  lastEntityMessage?: (InfoMessage | ThinkingMessage)
  thinkingAI: InfoAI[]
}

export const useChatStore = defineStore('dannn-chat', () => {
  const rooms = reactive<ChatItem[]>([])
  const currentChatID = ref<number | null>(null)
  const messages = useMessagesStore()
  const aiStore = useAIStore()
  const configStore = useConfig()

  const findRoomById = (id: number) => rooms.find(room => room.id === id)

  function addRooms(roomsToAdd: InfoChat[]) {
    roomsToAdd.forEach((room) => {
      rooms.push({
        ...room,
        participant: room.participant || [], // Ensure participant is initialized
        lastEntityMessage: messages.findChatLastMessage(room.id),
        thinkingAI: [],
      })
    })
  }

  watchThrottled(
    messages.messages,
    () => {
      rooms.forEach((room) => {
        const lastMessage = messages.findChatLastMessage(room.id)
        if (lastMessage) {
          room.lastEntityMessage = { ...lastMessage }
        }
      })
    },
    { throttle: 500 },
  )

  database.room.getAllRooms().then((fetchedRooms) => {
    addRooms(fetchedRooms)
  })

  const currentChat = computed(() => {
    return currentChatID.value ? findRoomById(currentChatID.value) : null
  })

  const currentChatMessage = computed(() => {
    if (!currentChatID.value) {
      return []
    }

    const messageConfig = messages.findMessagesByRoomId(currentChatID.value)

    if (!messageConfig) {
      return []
    }

    return messageConfig.messages
  })

  async function addRoom(room: InsertChat) {
    const newRoom = await database.room.insertRoom(room)
    addRooms([{
      ...newRoom,
      participant: [], // Initialize with an empty participant array
    }])
    return newRoom
  }

  async function addAiToChat(id: number, aiID: number) {
    const room = findRoomById(id)
    if (!room) {
      throw new Error('Room not found')
    }

    await database.room.addAiToRoom(id, aiID)

    const ai = aiStore.findAiById(aiID)

    if (!ai) {
      throw new Error('AI not found')
    }

    room.participant.push(ai)
  }

  function setCurrentChatID(id: number) {
    currentChatID.value = id
    configStore.setCurrentChatId(id)
  }

  async function sendQuestionToChat(question: string) {
    if (!currentChatID.value) {
      throw new Error('No chat selected')
    }

    const room = findRoomById(currentChatID.value)
    if (!room) {
      throw new Error('Room not found')
    }

    const aiIds = room.participant.map(participant => participant.id)

    const message = await database.message.createQuestion({
      type: 'text',
      content: question,
      roomId: room.id,
      aiIds,
    })

    messages.addMessagesByRoomId(room.id, [message])

    const contextMessages = await database.room.getRoomContextMessages(room.id)

    const context = contextMessages.map((msg): QuestionContext => {
      return {
        role: msg.senderType === 'human' ? 'user' : 'assistant',
        content: msg.content,
      }
    })

    const needJoinPrompt = await database.room.updateRoomMemoryInterval(room.id)

    if (needJoinPrompt && room.prompt) {
      context.unshift({
        role: 'system',
        content: room.prompt,
      })
    }

    broadcast({
      content: question,
      type: 'text',
      roomId: currentChatID.value,
      aiIds,
      context,
      id: message.id,
    })
  }

  // 监听AI思考开始和结束事件
  onAiThinking((data) => {
    const room = findRoomById(data.roomId)
    if (!room) {
      console.warn(`Room with ID ${data.roomId} not found for AI thinking event.`)
      return
    }

    const ai = aiStore.findAiById(data.aiId)
    if (!ai) {
      console.warn(`AI with ID ${data.aiId} not found for AI thinking event.`)
      return
    }

    room.thinkingAI.push(ai)
  })

  onAiEndThink((data) => {
    const room = findRoomById(data.roomId)
    if (!room) {
      console.warn(`Room with ID ${data.roomId} not found for AI end thinking event.`)
      return
    }

    room.thinkingAI = room.thinkingAI.filter(ai => ai.id !== data.aiId)
  })

  return {
    rooms,
    currentChatID,
    setCurrentChatID,
    currentChat,
    currentChatMessage,
    addRoom,
    addAiToChat,
    sendQuestionToChat,
  }
})
