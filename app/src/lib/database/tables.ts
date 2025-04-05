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
  'icon',
  'title',
  'isDisabled',
  'lastMessageAt',
  'role',
  'description',
  'version',
  'module',
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
  'chatId',
  'senderId',
  'content',
  'timestamp',
  'senderIsUser',
  'senderIsAI',
  'stream',
  'complete',
  'toHTML'
]

export const tableSchemasV1 = {
  aiModels: aiModelKeys.join(', '),
  aiChats: aiChatKeys.join(', '),
  aiMessages: aiMessageKeys.join(', '),
}
