import { int, integer, primaryKey, sqliteTable as table, text } from 'drizzle-orm/sqlite-core'

export const ais = table('ais', {
  name: text('id').primaryKey().unique(),
  title: text('username').notNull(),
  version: text('email').notNull(),
  description: text('description'),
  role: text('role'),
  prompt: text('prompt'),
  type: text('type').notNull(),
  models: text('models').notNull(),
})

export const chats = table('chats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  avatar: text('avatar'),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  isPublic: int('is_public').notNull(),
  isFavorite: int('is_favorite').notNull(),
  isLocked: int('is_locked').notNull(),
  isPinned: int('is_pinned').notNull(),
  isArchived: int('is_archived').notNull(),
})

// // 在 chat_participants 中建立 AI 和 chat 的关联
export const chatParticipants = table(
  'chat_participants',
  {
    aiName: integer('ai_name'),
    chatId: integer('chat_id'),
  },
  table => [
    primaryKey({ columns: [table.aiName, table.chatId] }),
  ],
)

export const messages = table('messages', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  sortBy: int('sort_by').notNull(),
  chatId: text('chat_id').notNull(),
  createdAt: text('created_at').notNull(),
})
