import { int, integer, primaryKey, sqliteTable as table, text } from 'drizzle-orm/sqlite-core'

export const ais = table('ais', {
  name: text('id').primaryKey().unique(),
  title: text('username').notNull(),
  version: text('email').notNull(),
  avatar: text('avatar'),
  description: text('description'),
  role: text('role'),
  prompt: text('prompt'),
  type: text('type').notNull(),
  models: text('models').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isActive: int('is_active').notNull().default(1),
  lastUsedAt: text('last_used_at'),
  versionHistory: text('version_history'),
  tags: text('tags'),
  configuration: text('configuration'),
  createdBy: text('created_by'),
})

export const rooms = table('rooms', {
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
    aiName: text('ai_name'),
    roomId: integer('room_id'),
  },
  table => [
    primaryKey({ columns: [table.aiName, table.roomId] }),
  ],
)

export const messages = table('messages', {
  id: text('id').primaryKey(),

  content: text('content').notNull(),
  messageType: text('message_type', {
    enum: ['text', 'image', 'markdown', 'system', 'image', 'file', 'audio', 'video', 'json', 'command'],
  }).notNull().default('text'),

  sortBy: int('sort_by').notNull(),
  roomId: integer('chat_id').notNull().references(() => rooms.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),

  reference: text('reference'),
  senderType: text('sender_type', {
    enum: ['ai', 'human'], // 类型约束（不是强约束，仅提供类型提示）
  }).notNull(),
  senderId: text('sender_id'), // ai 用 aiName，human 固定写死为 "local" 就行
  parentId: text('parent_id'), // 上下文关联 ✅
  status: text('status'), // 消息状态：pending/success/error
  meta: text('meta'), // AI 生成详情、tokens 等
  isAIAutoChat: int('is_ai_auto_chat').notNull().default(0),

  isStreaming: int('is_streaming').notNull().default(0),
  streamGroupId: text('stream_group_id'),
  streamIndex: int('stream_index'),

  // 扩展结构化回复（可选）
  functionCall: text('function_call'),
  functionResponse: text('function_response'),
})
