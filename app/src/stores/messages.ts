import type { InfoMessage } from 'common/types'
import { getMessagesByPage, onAllMessages } from 'base/api/message'
import { getAllRooms } from 'base/api/room'
import { sortBy } from 'lodash'

export interface MessageItem extends InfoMessage {
  contentList: InfoMessage[]
}

export interface MessageNode {
  messages: MessageItem[]
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

  function mergeStreamingMessages(messages: InfoMessage[]): MessageItem[] {
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

    const mergedMessages: MessageItem[] = []

    // 合并流式消息
    for (const [groupId, groupMessages] of Object.entries(groupedMessages)) {
      if (groupId === 'non-streaming') {
        // 非流式消息直接加入结果
        mergedMessages.push(...groupMessages.map(message => ({ ...message, contentList: [message] })))
      }
      else {
        // 按 streamIndex 排序
        const sortedMessages = groupMessages.sort((a, b) => (a.streamIndex ?? 0) - (b.streamIndex ?? 0))

        mergedMessages.push({
          ...sortedMessages[0],
          content: sortedMessages.map(message => message.content).join(''), // 合并内容
          contentList: groupMessages,
        })
      }
    }

    return mergedMessages
  }

  function addMessagesByRoomId(roomId: RoomID, messageList: InfoMessage[], options: { page?: number, pageSize?: number, total?: number } = {}) {
    const messageNode = messages.get(roomId)
    const sortMessagesList = sortMessages(messageList)
    const mergedMessages = mergeStreamingMessages(sortMessagesList)

    if (messageNode) {
      function upsertMessage(newMessage: MessageItem) {
        const existingMessageIndex = messageNode!.messages.findIndex(msg => msg.id === newMessage.id)
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

      mergedMessages.forEach((message) => {
        if (message.isStreaming) {
          const existingMessage = messageNode.messages.find(msg => msg.streamGroupId === message.streamGroupId)
          if (existingMessage) {
            const streamMessageList = sortBy(existingMessage.contentList.concat([message]), (message) => {
              return message.streamGroupId
            })
            existingMessage.content = streamMessageList.map(message => message.content).join('')
            upsertMessage(existingMessage)
          }
          else {
            upsertMessage(message)
          }
        }
        else {
          upsertMessage(message)
        }
      })
    }
    else {
      messages.set(roomId, {
        messages: mergedMessages,
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
    console.log('Received message:', message)
    addMessagesByRoomId(message.roomId, [message])
  })

  init()

  return {
    messages,
    findMessagesByRoomId,
  }
})
