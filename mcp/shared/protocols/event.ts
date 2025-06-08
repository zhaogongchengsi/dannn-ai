import type { BaseMessage } from './base'

export type EventScope = 'global' | 'room' | 'user'

/**
 * 事件通知消息
 */
export interface EventMessage extends BaseMessage {
  type: 'event'

  /**
   * 事件名，例如 "userJoined"、"pluginRegistered"
   */
  event: string

  /**
   * 事件负载数据，具体结构依事件而定
   */
  payload?: unknown

  /**
   * 作用域，比如全局、某个房间或某个用户
   */
  scope?: EventScope

  /**
   * 目标标识，依据 scope 的含义可能是房间ID或用户ID
   */
  target?: string
}

export interface AuthenticateRequest {
  id: string
  userId: string
  timestamp: number
}