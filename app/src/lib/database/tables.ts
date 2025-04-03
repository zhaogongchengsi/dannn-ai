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
  'apiBaseURL',
  'models',
  'description',
  'frequencyPenalty',
  'functionCalls',
  'presencePenalty',
  'lastMessageAt',
  'maxTokens',
  'version',
  'module',
  'role',
  'prompt',
  'temperature',
  'topP',
]

const aiChatKeys: AIChatKeys[] = [
  'id',
  'title',
  'description',
  'temperature',
  'maxTokens',
  'presencePenalty',
  'frequencyPenalty',
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
  aiChat: aiChatKeys.join(', '),
  aiMessages: aiMessageKeys.join(', '),
}
