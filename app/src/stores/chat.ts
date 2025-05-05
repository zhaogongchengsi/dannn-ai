import type { CreateRoomOptions } from 'base/api/room'
import type { RoomData } from 'common/types'
import { createRoom, getAllRooms, setAiToRoom } from 'base/api/room'
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useChatStore = defineStore('dannn-chat', () => {
  const rooms = reactive<RoomData[]>([])
  const currentChatID = ref<number | null>(null)

  const aiStore = useAIStore()
  const messages = useMessagesStore()

  const findRoomById = (id: number) => rooms.find(room => room.id === id)

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

  getAllRooms().then((data) => {
    rooms.push(...data)
  })

  async function addRoom(room: CreateRoomOptions) {
    const newRoom = await createRoom(room)
    rooms.push({
      ...newRoom,
      participant: [],
    })
    return newRoom
  }

  async function addAiToChat(id: number, aiID: number) {
    const room = findRoomById(id)
    if (!room) {
      throw new Error('Room not found')
    }

    await setAiToRoom(id, aiID)

    const ai = aiStore.findAiById(aiID)

    if (!ai) {
      throw new Error('AI not found')
    }

    room.participant.push(ai)
  }

  function setCurrentChatID(id: number) {
    currentChatID.value = id
  }

  return {
    rooms,
    currentChatID,
    setCurrentChatID,
    currentChat,
    currentChatMessage,
    addRoom,
    addAiToChat,
  }
})
