import { int, integer, primaryKey, sqliteTable as table, text } from 'drizzle-orm/sqlite-core'

export const ais = table('ais', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  title: text('title').notNull(),
  version: text('version').notNull(),

  author: text('author'),
  avatar: text('avatar'),
  description: text('description'),

  type: text('type').notNull(),
  models: text('models').notNull(),

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),

  isActive: int('is_active').notNull().default(1),

  lastUsedAt: text('last_used_at'),

  versionHistory: text('version_history'),

  tags: text('tags'),
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
  // 最后消息
  lastMessage: integer('last_message_at').default(0), // 最后消息 id
  // 最大设置的上下文消息数量
  maxContextMessages: int('max_context_messages').notNull().default(3),
  // 多少轮聊天后提示词会被重新加入到上下文中
  memoryInterval: int('memory_interval').notNull().default(15), // 每隔多少轮将提示词加入对话，0 表示不自动加入
  // 本房间提示词
  prompt: text('prompt'), // 这个房间的提示词
  // 本房间 memoryInterval 初始值
  memoryIntervalInitialValue: int('memory_interval_initial_value').notNull().default(15), // 初始值，0 表示不自动加入
})

// // 在 chat_participants 中建立 AI 和 chat 的关联
export const chatParticipants = table(
  'chat_participants',
  {
    aiId: integer('ai_id'),
    roomId: integer('room_id'),
  },
  table => [
    primaryKey({ columns: [table.aiId, table.roomId] }),
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
  senderId: integer('sender_id'), // ai 用 ai id，human 固定写死为 0 就行
  parentId: text('parent_id'), // 上下文关联 ✅
  status: text('status'), // 消息状态：pending/success/error/canceled/thinking
  meta: text('meta'), // AI 生成详情、tokens 等

  isStreaming: int('is_streaming').notNull().default(0),
  streamGroupId: text('stream_group_id'),
  streamIndex: int('stream_index'),

  // 扩展结构化回复（可选）
  functionCall: text('function_call'),
  functionResponse: text('function_response'),

  isInContext: integer('is_in_context').notNull().default(0), // 是否在上下文中
})

export const kv = table('kv', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
})

export const envs = table('envs', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
})
