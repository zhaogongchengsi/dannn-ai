import { z } from 'zod'
import { database } from './database' // Adjust the import path based on your project structure

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
  }
  await database.aiChats.add(chat)
  return chat
}
