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
  'toHTML',
]

// helper: 将 id 转为主键形式
function withPrimaryKey(keys: string[]): string {
  return keys.join(', ')
}

export const tableSchemasV1 = {
  aiModels: withPrimaryKey(aiModelKeys),
  aiChats: withPrimaryKey(aiChatKeys),
  aiMessages: withPrimaryKey(aiMessageKeys),
}
