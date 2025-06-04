import type { InfoMessage, MessageStatus } from '@/node/database/service/message'
import { database } from '@/lib/database'
import { onAiEndThink, onAiThinking, onAnswer, onAnswerStatusUpdate } from '@/lib/extension'

export interface ThinkingMessage extends InfoMessage {
  type: 'thinking'
}

export interface MessageNode {
  messages: (InfoMessage | ThinkingMessage)[]
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

  /**
   * @description 查找指定房间的消息
   * @param roomId 房间ID
   * @returns 返回房间的消息列表
   */
  function findMessagesByRoomId(roomId: RoomID) {
    return messages.get(roomId)
  }

  /**
   * @description 查找指定房间的最后一条消息
   * @param roomId 房间ID
   * @returns 返回房间的最后一条消息，如果没有消息则返回null
   */
  function findChatLastMessage(roomId: RoomID): (InfoMessage | ThinkingMessage) | undefined {
    const messageNode = messages.get(roomId)
    if (messageNode && messageNode.messages.length > 0) {
      const messageConfig = messageNode.messages.at(-1)
      if (messageConfig) {
        return messageConfig
      }
    }
    return undefined
  }

  /**
   * @description 对消息列表进行排序
   * @param messageList 消息列表
   * @returns 返回排序后的消息列表
   */
  const sortMessages = (messageList: InfoMessage[]) => {
    return messageList.sort((a, b) => {
      return a.sortBy - b.sortBy
    })
  }

  /**
   * @description 添加或更新指定房间的消息
   * @param roomId 房间ID
   * @param messageList 消息列表
   * @param options 分页选项
   */
  function addMessagesByRoomId(roomId: RoomID, messageList: (InfoMessage | ThinkingMessage)[], options: { page?: number, pageSize?: number, total?: number } = {}) {
    const messageNode = messages.get(roomId)
    const sortMessagesList = sortMessages(messageList)

    if (messageNode) {
      function upsertMessage(newMessage: InfoMessage) {
        const existingMessageIndex = messageNode!.messages.findLastIndex(msg => msg.id === newMessage.id)
        if (existingMessageIndex !== -1) {
          messageNode!.messages = [
            ...messageNode!.messages.slice(0, existingMessageIndex),
            newMessage,
            ...messageNode!.messages.slice(existingMessageIndex + 1),
          ]
        }
        else {
          messageNode!.messages.push(newMessage)
        }
        messageNode!.total = messageNode!.messages.length
      }

      sortMessagesList.forEach((message) => {
        upsertMessage(message)
      })
    }
    else {
      messages.set(roomId, {
        messages: sortMessagesList,
        page: PAGE,
        pageSize: PAGE_SIZE,
        total: sortMessagesList.length,
        loading: false,
        ...options,
      })
    }
  }

  async function updateMessageContextTrue(roomId: number, messageId: string) {
    const messageNode = messages.get(roomId)
    if (messageNode) {
      await database.message.updateAIMessageContextTrue(messageId)
      const message = messageNode.messages.find(msg => msg.id === messageId)
      if (message) {
        message.isInContext = 1
      }
    }
  }

  async function updateMessageContextFalse(roomId: number, messageId: string) {
    const messageNode = messages.get(roomId)
    if (messageNode) {
      await database.message.updateAIMessageContextFalse(messageId)
      const message = messageNode.messages.find(msg => msg.id === messageId)
      if (message) {
        message.isInContext = 0
      }
    }
  }

  async function updateMessageStatue(messageId: string, status: MessageStatus) {
    await database.message.updateMessageStatus(messageId, status)
    const rooms = Array.from(messages.keys())
    for (const roomId of rooms) {
      const messageNode = messages.get(roomId)
      if (messageNode) {
        const message = messageNode.messages.find(msg => msg.id === messageId)
        if (message) {
          message.status = status
        }
      }
    }
  }

  // 监听扩展进程发过来的回答
  onAnswer((message) => {
    addMessagesByRoomId(message.roomId, [message])
  })

  // 监听回答状态更新事件
  onAnswerStatusUpdate((data) => {
    updateMessageStatue(data.messageId, data.status)
  })

  async function init() {
    const rooms = await database.room.getAllRooms()

    for (const room of rooms) {
      const { data, total } = await database.message.getMessagesByPageDesc(room.id, PAGE, PAGE_SIZE)
        .catch((err) => {
          console.error(`Error fetching messages for room ${room.id}:`, err)
          return {
            data: [],
            total: 0,
          }
        })

      addMessagesByRoomId(room.id, data, {
        total,
        page: PAGE,
        pageSize: PAGE_SIZE,
      })
    }
  }

  init()

  return {
    messages,
    findMessagesByRoomId,
    updateMessageContextTrue,
    updateMessageContextFalse,
    addMessagesByRoomId,
    findChatLastMessage,
  }
})
