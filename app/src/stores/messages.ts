import type { InfoMessage } from 'common/types'
import { getMessagesByPage, onAllMessages } from 'base/api/message'
import { getAllRooms } from 'base/api/room'
import { sortBy } from 'lodash'

export interface MessageNode {
  messages: InfoMessage[]
  page: number
  pageSize: number
  total: number
  loading: boolean
}

export type RoomID = number

const PAGE = 1
const PAGE_SIZE = 20

export const useMessagesStore = defineStore('dannn-messages', () => {
  const messages = reactive<Map<RoomID, MessageNode>>(new Map())

  function findMessagesByRoomId(roomId: RoomID) {
    return messages.get(roomId)
  }

  const sortMessages = (messageList: InfoMessage[]) => {
    return sortBy(messageList, (message) => {
      return message.sortBy
    })
  }

  function mergeStreamingMessages(messages: InfoMessage[]): InfoMessage[] {
    // 按 streamGroupId 分组
    const groupedMessages = messages.reduce((groups, message) => {
      if (message.isStreaming && message.streamGroupId) {
        if (!groups[message.streamGroupId]) {
          groups[message.streamGroupId] = []
        }
        groups[message.streamGroupId].push(message)
      }
      else {
        // 非流式消息直接放入一个特殊组
        if (!groups['non-streaming']) {
          groups['non-streaming'] = []
        }
        groups['non-streaming'].push(message)
      }
      return groups
    }, {} as Record<string, InfoMessage[]>)

    const mergedMessages: InfoMessage[] = []

    // 合并流式消息
    for (const [groupId, groupMessages] of Object.entries(groupedMessages)) {
      if (groupId === 'non-streaming') {
        // 非流式消息直接加入结果
        mergedMessages.push(...groupMessages)
      }
      else {
        // 按 streamIndex 排序
        const sortedMessages = groupMessages.sort((a, b) => (a.streamIndex ?? 0) - (b.streamIndex ?? 0))
        // 合并 content 字段
        const mergedContent = sortedMessages.map(msg => msg.content).join('')
        // 使用第一个消息作为模板，生成合并后的消息
        const mergedMessage = {
          ...sortedMessages[0],
          content: mergedContent,
          isStreaming: 0, // 合并后不再是流式消息
          streamGroupId: null,
          streamIndex: null,
        }
        mergedMessages.push(mergedMessage)
      }
    }

    return mergedMessages
  }

  function addMessagesByRoomId(roomId: RoomID, messageList: InfoMessage[], options: { page?: number, pageSize?: number, total?: number } = {}) {
    const messageNode = messages.get(roomId)
    const sortMessagesList = sortMessages(messageList)
    const mergedMessages = mergeStreamingMessages(sortMessagesList)
    if (messageNode) {
      messageNode.messages.push(...mergedMessages)
      messageNode.total += messageList.length
    }
    else {
      messages.set(roomId, {
        messages: sortMessages(mergedMessages),
        page: PAGE,
        pageSize: PAGE_SIZE,
        total: mergedMessages.length,
        loading: false,
        ...options,
      })
    }
  }

  async function init() {
    const rooms = await getAllRooms()

    for (const room of rooms) {
      const { data, total } = await getMessagesByPage(room.id, PAGE, PAGE_SIZE)
        .catch((err) => {
          console.error(`Error fetching messages for room ${room.id}:`, err)
          return {
            data: [],
            total: 0,
          }
        })

      addMessagesByRoomId(room.id, data, {
        total,
      })
    }
  }

  onAllMessages((message: InfoMessage) => {
    addMessagesByRoomId(message.roomId, [message])
  })

  init()

  return {
    messages,
    findMessagesByRoomId,
  }
})
