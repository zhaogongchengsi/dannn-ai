import type { StreamAnswerMessage } from '@dannn/schemas'
import type { AIChat, AIMessage, ID } from './models'
import { z } from 'zod'
import { markdownToHtml } from '../shiki'
import { database } from './database'

export async function findAllChats() {
  return await database.aiChats.toArray()
}

export const createChatSchemas = z.object({
  title: z.string().min(1, '名称不能为空').describe('聊天名称'),
  description: z.string().optional().describe('描述'),
  systemPrompt: z.string().optional().describe('提示词'),
})

export type CreateChatSchemas = z.infer<typeof createChatSchemas>

export interface Room extends AIChat {
  messages: AIMessage[]
}

export async function createChat(data: CreateChatSchemas) {
  const { title, description, systemPrompt } = createChatSchemas.parse(data)
  const chatId = crypto.randomUUID()
  const chat = {
    id: chatId,
    title,
    description,
    systemPrompt,
    createdAt: Date.now(),
    updateAt: Date.now(),
    participants: [],
    lastMessageSortId: 0,
  }
  await database.aiChats.add(chat)
  return chat
}

export async function updateChatParticipants(chatId: string, participants: string[]) {
  const chat = await database.aiChats.get(chatId)
  if (!chat) {
    throw new Error(`Chat with id ${chatId} not found`)
  }
  chat.participants = participants
  chat.updateAt = Date.now()
  await database.aiChats.put(chat)
  return chat
}

export async function addAiMemberToChat(chatId: string, aiMemberId: string) {
  const chat = await database.aiChats.get(chatId)
  if (!chat) {
    throw new Error(`Chat with id ${chatId} not found`)
  }
  if (!chat.participants.includes(aiMemberId)) {
    chat.participants.push(aiMemberId)
    chat.updateAt = Date.now()
    await database.aiChats.put(chat)
  }
  return chat
}

export async function findLastMessageSortId(chatId: string) {
  const chat = await database.aiChats.where('id').equals(chatId).first()
  if (!chat) {
    throw new Error(`Chat with id ${chatId} not found`)
  }
  return chat.lastMessageSortId
}

export async function updateLastMessageSortId(chatId: string, sortId: number) {
  const chat = await database.aiChats.get(chatId)
  if (!chat) {
    throw new Error(`Chat with id ${chatId} not found`)
  }
  chat.lastMessageSortId = sortId
  chat.updateAt = Date.now()
  await database.aiChats.put(chat)
  return chat
}

export async function findAllChatsWithMessages(): Promise<Room[]> {
  const chats = await database.aiChats.toArray()
  const chatsWithMessages = await Promise.all(
    chats.map(async (chat) => {
      const messages = await database.aiMessages
        .where('chatId')
        .equals(chat.id)
        .toArray()

      return { ...chat, messages: messages.sort((a, b) => a.sortId - b.sortId) } as Room
    }),
  )
  return chatsWithMessages
}

export async function findMessageById(messageId: string): Promise<AIMessage | undefined> {
  return await database.aiMessages.where('id').equals(messageId).first()
}

export async function findChatById(chatId: string): Promise<AIChat | undefined> {
  return await database.aiChats.get(chatId)
}

export async function findMessagesBySortIdDesc(
  chatId: string,
  pageSize: number,
  pageIndex: number,
): Promise<AIMessage[]> {
  return await database.aiMessages
    .where('chatId') // 过滤条件
    .equals(chatId)
    .reverse() // 倒序排列
    .offset(pageIndex * pageSize) // 跳过前面的数据
    .limit(pageSize) // 限制返回的数据量
    .toArray()
}

export async function addMessage(message: AIMessage) {
  const id = await database.aiMessages.add(message)
  return (await findMessageById(id))!
}

export async function createQuestionMessage(
  question: string,
  chatId: string,
): Promise<AIMessage> {
  return await database.transaction('rw', [database.aiMessages, database.aiChats], async () => {
    const lastSortId = await findLastMessageSortId(chatId)
    const sortId = lastSortId + 1

    const message: AIMessage = {
      id: crypto.randomUUID(),
      chatId,
      content: question,
      timestamp: Date.now(),
      senderIsUser: true,
      sortId,
      senderId: '',
    }

    await updateLastMessageSortId(chatId, sortId)

    return await addMessage(message)
  })
}

export async function createAnswerMessage(
  answer: string,
  chatId: string,
  senderId: string,
  html?: string,
  id: ID = crypto.randomUUID(),
): Promise<AIMessage> {
  return await database.transaction('rw', [database.aiMessages, database.aiChats], async () => {
    const lastSortId = await findLastMessageSortId(chatId)
    const sortId = lastSortId + 1

    const message: AIMessage = {
      id,
      chatId,
      content: answer,
      timestamp: Date.now(),
      senderIsAI: true,
      sortId,
      senderId,
      toHTML: html,
    }

    await updateLastMessageSortId(chatId, sortId)

    return await addMessage(message)
  })
}

export async function updateMessage(message: AIMessage) {
  await database.aiMessages.update(message.id, message)
  return (await findMessageById(message.id))!
}

export async function updateStreamMessageContent(messageId: string, stream: StreamAnswerMessage) {
  const message = await findMessageById(messageId)

  if (!message) {
    throw new Error(`Message with id ${messageId} not found`)
  }

  message.stream = message.stream || []
  message.stream.push(stream)
  message.complete = stream.complete
  message.timestamp = Date.now()

  message.stream.sort((a, b) => a.sortId - b.sortId)

  message.content = message.stream.map(s => s.content).join('')

  if (message.complete) {
    message.toHTML = markdownToHtml(message.content)
  }

  return await updateMessage(message)
}
