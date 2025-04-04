import type { AIChat, AIMessage, AIModel } from './models'

type AIModelKeys = keyof AIModel
type AIChatKeys = keyof AIChat
type AIMessageKeys = keyof AIMessage

const aiModelKeys: AIModelKeys[] = [
  'id',
  'name',
  'type',
  'createdAt',
  'updateAt',
  'isDeleted',
  'models',
  'description',
  'lastMessageAt',
  'version',
  'module',
  'role',
  'prompt',
]

const aiChatKeys: AIChatKeys[] = [
  'id',
  'title',
  'description',
  'systemPrompt',
  'createdAt',
  'updateAt',
  'participants',
]

const aiMessageKeys: AIMessageKeys[] = [
  'id',
  'sortId',
  'sessionId',
  'senderId',
  'content',
  'timestamp',
]

export const tableSchemasV1 = {
  aiModels: aiModelKeys.join(', '),
  aiChats: aiChatKeys.join(', '),
  aiMessages: aiMessageKeys.join(', '),
}
