/**
 * AI 信息表
 */
export interface AIModel {
  id: string // AI 唯一标识符
  name: string // AI 名称
  version: string // AI 版本
  icon?: string // AI 图标（可选）
  description?: string // AI 描述（可选）
  createdAt: number // 创建时间戳
  type?: string // AI 类型
}

/**
 * AI 会话信息表
 * 一个会话可以包含多个 AI
 */
export interface AISession {
  id: string // AI 唯一标识符
  name: string // AI 名称
  version: string // AI 版本
  description?: string // AI 描述（可选）
  type: 'openai' | 'custom' | 'local' | string // AI 类型（支持 OpenAI、本地、自定义等）
  apiKey?: string // OpenAI 或其他 API 的密钥（可选）
  baseURL?: string // 自定义 API 地址（可选）
  models: string[] // 支持的模型列表（如 ['gpt-4', 'gpt-3.5']）
  model?: string // 使用的模型
  temperature?: number // 生成文本时的随机性
  maxTokens?: number // 最大 token 长度
  topP?: number // 采样参数，类似于 temperature
  presencePenalty?: number // 影响 AI 提及新主题的倾向
  frequencyPenalty?: number // 影响 AI 重复词的倾向
  systemPrompt?: string // 自定义系统提示词
  createdAt: number // 创建时间戳
  updateAt: number // 更新时间戳
}

/**
 * AI 聊天消息表
 * 可能存储大文本内容
 */
export interface AIMessage {
  id: string // 消息唯一标识符
  sessionId: string // 关联的会话 ID
  senderId: string // 发送者 AI ID 或用户 ID
  content: string // 消息内容（可能是大文本）
  timestamp: number // 消息时间戳
}
