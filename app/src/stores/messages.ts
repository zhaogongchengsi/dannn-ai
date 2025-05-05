import type { InfoMessage } from 'common/types'
import { getMessagesByPage } from 'base/api/message'
import { getAllRooms } from 'base/api/room'

export interface MessageNode {
  messages: InfoMessage[]
  page: number
  pageSize: number
  total: number
  loading: boolean
}

export type RoomID = number

export const useMessagesStore = defineStore('dannn-messages', () => {
  const messages = reactive<Map<RoomID, MessageNode>>(new Map())

  function findMessagesByRoomId(roomId: RoomID) {
    return messages.get(roomId)
  }

  async function init() {
    const rooms = await getAllRooms()
    const page = 1
    const pageSize = 20

    for (const room of rooms) {
      const { data, total } = await getMessagesByPage(room.id, page, pageSize)
        .catch((err) => {
          console.error(`Error fetching messages for room ${room.id}:`, err)
          return {
            data: [],
            total: 0,
          }
        })

      messages.set(room.id, {
        messages: data,
        page,
        pageSize,
        total,
        loading: false,
      })
    }
  }

  init()

  return {
    messages,
    findMessagesByRoomId,
  }
})
