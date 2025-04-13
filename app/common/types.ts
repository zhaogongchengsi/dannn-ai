/**
 * 将指定的字段变为可选
 * @template T 原始接口
 * @template K 要变为可选的字段的键
 */
export type MakeFieldsOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export interface RoomData {
  title: string
  description: string | null
  avatar: string | null
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  isPublic: number
  isFavorite: number
  isLocked: number
  isPinned: number
  isArchived: number
  participant: AIData[]
}

export interface AIData {
  id: number
  name: string
  title: string
  version: string
  avatar: string | null
  description: string | null
  role: string | null
  prompt: string | null
  type: string
  models: string
  createdAt: string
  updatedAt: string
  isActive: number
  lastUsedAt: string | null
  versionHistory: string | null
  tags: string | null
  configuration: string | null
  createdBy: string | null
}

export interface AiConfig {
  name: string
  title: string
  avatar?: string
  author?: string
  version: string
  description?: string
  role?: string
  prompt?: string
  type?: string
  models?: string
  tags?: string[]
  configuration?: Record<string, any>
  createdBy?: string
}


export interface InfoMessage {
  status: string | null;
  id: string;
  content: string;
  messageType: "json" | "text" | "image" | "markdown" | "system" | "file" | "audio" | "video" | "command";
  sortBy: number;
  createdAt: string;
  functionResponse: string | null;
  roomId: number;
  reference: string | null;
  senderType: "ai" | "human";
  senderId: string | null;
  parentId: string | null;
  meta: string | null;
  isAIAutoChat: number;
  isStreaming: number;
  streamGroupId: string | null;
  streamIndex: number | null;
  functionCall: string | null;
}