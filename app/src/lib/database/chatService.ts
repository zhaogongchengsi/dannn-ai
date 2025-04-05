import { z } from 'zod'
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
  const chat = await database.aiChats.get(chatId)
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
