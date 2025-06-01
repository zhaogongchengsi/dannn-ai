import type { QuestionContext } from '@/common/schema'
import type { InfoChat, InsertChat } from '~/node/database/service/room'
import { defineStore } from 'pinia'
import { database } from '@/lib/database'
import { broadcast } from '@/lib/extension'

export const useChatStore = defineStore('dannn-chat', () => {
  const rooms = reactive<InfoChat[]>([])
  const currentChatID = ref<number | null>(null)
  const messages = useMessagesStore()
  const aiStore = useAIStore()

  const findRoomById = (id: number) => rooms.find(room => room.id === id)

  database.room.getAllRooms().then((fetchedRooms) => {
    rooms.push(...fetchedRooms)
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
    rooms.push({
      ...newRoom,
      participant: [], // Initialize with an empty participant array
    })
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
