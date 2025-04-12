import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { getAllRooms } from 'base/room'
import { RoomData } from '@common/types'

export const useChatStore = defineStore('dannn-chat', () => {
  const rooms = reactive<RoomData[]>([])
  const currentChatID = ref<string | null>(null)

  getAllRooms().then((data) => {
    rooms.push(...data)
  })

  return {
    rooms,
    currentChatID,
  }
})
