import { z } from 'zod'

export const ChatMessageSchema = z.object({
  id: z.number().optional(), // IndexedDB 自增主键
  contextId: z.string(), // 聊天上下文 ID
  userMessage: z.string(),
  botMessage: z.string(),
  timestamp: z.string(), // ISO 时间格式
  metadata: z.record(z.any()).optional(), // 允许扩展的元数据字段
})

export const dbChatMessageSchemaV1 = `$id, contextId, timestamp, userMessage, botMessage`

export type ChatMessage = z.infer<typeof ChatMessageSchema>
