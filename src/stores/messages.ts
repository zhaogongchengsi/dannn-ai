import type { InfoMessage } from '@/common/types'
import { getMessagesByPage, onAllMessages } from '@/base/api/message'
import { getAllRooms, onAiEndThink, onAiThinking, updateAIMessageContextFalse, updateAIMessageContextTrue } from '@/base/api/room'

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

  function findMessagesByRoomId(roomId: RoomID) {
    return messages.get(roomId)
  }

  const sortMessages = (messageList: InfoMessage[]) => {
    return messageList.sort((a, b) => {
      return a.sortBy - b.sortBy
    })
  }

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

  function deleteMessagesByRoomId(roomId: RoomID, messageId: string) {
    const messageNode = messages.get(roomId)
    if (messageNode) {
      messageNode.messages = messageNode.messages.filter(
        msg => !(msg.id === messageId),
      )
      messageNode.total = messageNode.messages.length
    }
  }

  function addThinkingMessagesByRoomId(roomId: RoomID, aiId: number) {
    const messageNode = messages.get(roomId)

    if (messageNode) {
      const lastMessage = messageNode.messages.at(-1)
      const message: ThinkingMessage = {
        type: 'thinking',
        status: null,
        id: `${roomId}-${aiId}`,
        content: '思考中...',
        messageType: 'text',
        sortBy: lastMessage?.sortBy ? lastMessage.sortBy + 1 : 0,
        createdAt: new Date().toISOString(),
        functionResponse: null,
        roomId,
        reference: null,
        senderType: 'ai',
        senderId: aiId,
        parentId: null,
        meta: null,
        isAIAutoChat: 0,
        isStreaming: 0,
        streamGroupId: null,
        streamIndex: null,
        functionCall: null,
        isInContext: null,
      }

      addMessagesByRoomId(roomId, [message])
    }
  }

  async function updateMessageContextTrue(roomId: number, messageId: string) {
    const messageNode = messages.get(roomId)
    await updateAIMessageContextTrue(messageId)
    if (messageNode) {
      const message = messageNode.messages.find(msg => msg.id === messageId)
      if (message) {
        message.isInContext = 1
      }
    }
  }

  async function updateMessageContextFalse(roomId: number, messageId: string) {
    const messageNode = messages.get(roomId)
    await updateAIMessageContextFalse(messageId)
    if (messageNode) {
      const message = messageNode.messages.find(msg => msg.id === messageId)
      if (message) {
        message.isInContext = 0
      }
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

  onAiThinking((data) => {
    addThinkingMessagesByRoomId(data.roomId, data.aiId)
  })

  onAiEndThink((data) => {
    const messageNode = messages.get(data.roomId)
    if (messageNode) {
      deleteMessagesByRoomId(data.roomId, `${data.roomId}-${data.aiId}`)
    }
  })

  onAllMessages((message: InfoMessage) => {
    addMessagesByRoomId(message.roomId, [message])
  })

  init()

  return {
    messages,
    findMessagesByRoomId,
    updateMessageContextTrue,
    updateMessageContextFalse,
  }
})
