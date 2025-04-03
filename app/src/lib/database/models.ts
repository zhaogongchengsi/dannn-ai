import type { AIConfig } from '@dannn/schemas'

export type ID = `${string}-${string}-${string}-${string}-${string}` // UUID 格式的 ID
/**
 * AI 信息表
 */
export interface AIModel extends AIConfig {
  id: ID // AI 唯一标识符
  module: string // AI 当前使用的module
  createdAt: number // 创建时间戳
  updateAt: number // 更新时间戳
  isDeleted?: boolean // 是否被删除
  isDisabled?: boolean // 是否被禁用
  lastMessageAt?: number // 上次消息时间戳（可选）
}

/**
 * AI 会话信息表
 * 一个会话可以包含多个 AI
 */
export interface AIChat {
  id: ID // AI 唯一标识符
  title: string // AI 名称
  description?: string // AI 描述（可选）
  temperature?: number // 生成文本时的随机性
  maxTokens?: number // 最大 token 长度
  presencePenalty?: number // 影响 AI 提及新主题的倾向
  frequencyPenalty?: number // 影响 AI 重复词的倾向
  systemPrompt?: string // 自定义系统提示词
  createdAt: number // 创建时间戳
  updateAt: number // 更新时间戳
  participants: string[] // 参与者列表（AI ID）
}

/**
 * AI 聊天消息表
 * 可能存储大文本内容
 */
export interface AIMessage {
  id: ID // 消息唯一标识符
  sortId: number // 消息排序 ID
  sessionId: string // 关联的会话 ID
  senderId: string // 发送者 AI ID 或用户 ID
  content: string // 消息内容（可能是大文本）
  timestamp: number // 消息时间戳
}
