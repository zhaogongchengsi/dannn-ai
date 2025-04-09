import { int, primaryKey, sqliteTable as table, text } from 'drizzle-orm/sqlite-core'

export const ais = table('ais', {
  name: text('id').primaryKey(),
  title: text('username').notNull(),
  version: text('email').notNull(),
  description: text('description'),
  role: text('role'),
  prompt: text('prompt'),
  type: text('type').notNull(),
  models: text('models').notNull(),
})

export const chats = table('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  avatar: text('avatar'),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
})

// 在 chat_participants 中建立 AI 和 chat 的关联
export const chatParticipants = table(
  'chat_participants',
  {
    chatId: text('chat_id'),
    aiName: text('ai_name'),
  },
  (table) => {
    primaryKey({ columns: [table.aiName, table.chatId] })
  },
)

export const messages = table('messages', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  sortBy: int('sort_by').notNull(),
  chatId: text('chat_id').notNull(),
  createdAt: text('created_at').notNull(),
})
