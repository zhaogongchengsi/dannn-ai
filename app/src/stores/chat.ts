import type { CreateRoomOptions } from 'base/room'
import type { RoomData } from 'common/types'
import { createRoom, getAllRooms } from 'base/room'
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useChatStore = defineStore('dannn-chat', () => {
  const rooms = reactive<RoomData[]>([])
  const currentChatID = ref<number | null>(null)

  const currentChat = computed(() => {
    return rooms.find(room => room.id === currentChatID.value) ?? null
  })

  getAllRooms().then((data) => {
    rooms.push(...data)
  })

  async function addRoom(room: CreateRoomOptions) {
    const newRoom = await createRoom(room)
    rooms.push(newRoom)
    return newRoom
  }

  function setCurrentChatID(id: number) {
    currentChatID.value = id
  }

  return {
    rooms,
    currentChatID,
    setCurrentChatID,
    currentChat,
    addRoom,
  }
})
