import { int, sqliteTable as table, text } from 'drizzle-orm/sqlite-core'

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

export const extensions = table('extensions', {})

export const messages = table('messages', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  sortBy: int('sort_by').notNull(),
  chatId: text('chat_id').notNull(),
  createdAt: text('created_at').notNull(),
})
