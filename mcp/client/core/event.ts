import type { Socket } from 'socket.io-client'
import type { Logger } from '../../shared/logger'
import type { EventMessage, EventScope } from '../../shared/protocols/event'
import type { Connection } from './connection'
import { nanoid } from 'nanoid'

type EventHandler<T = any> = (data: T) => void

export class Events {
  private subscriptions = new Map<string, Map<string, EventHandler>>()
  private socket: Socket
  private logger: Logger

  constructor(private connection: Connection, logger: Logger) {
    this.socket = connection.getSocket()
    this.logger = logger

    // 监听所有事件消息
    this.socket.on('event', (message: EventMessage) => {
      this.handleEventMessage(message)
    })
  }

  /**
   * 处理收到的事件消息
   */
  private handleEventMessage(message: EventMessage) {
    const { event, payload } = message

    this.logger.debug?.(`[MCP Events] Received event: ${event}`, message)

    // 获取该事件的所有处理器
    const handlers = this.subscriptions.get(event)
    if (!handlers || handlers.size === 0) {
      return
    }

    // 调用所有处理器
    handlers.forEach((handler) => {
      try {
        handler(payload)
      }
      catch (error) {
        this.logger.error(`[MCP Events] Error in event handler for ${event}:`, error)
      }
    })
  }

  /**
   * 订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 订阅ID，用于取消特定订阅
   */
  public subscribe<T = any>(event: string, handler: EventHandler<T>): string {
    this.logger.debug?.(`[MCP Events] Subscribing to event: ${event}`)

    // 生成唯一的订阅ID
    const subscriptionId = nanoid()

    // 为事件创建处理器映射（如果不存在）
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Map())
    }

    // 存储处理器
    this.subscriptions.get(event)!.set(subscriptionId, handler as EventHandler)

    return subscriptionId
  }

  /**
   * 取消事件订阅
   * @param event 事件名称
   * @param subscriptionId 订阅ID或处理函数
   */
  public unsubscribe(event: string, subscriptionIdOrHandler?: string | EventHandler): void {
    const handlers = this.subscriptions.get(event)
    if (!handlers) {
      return
    }

    if (!subscriptionIdOrHandler) {
      // 如果没有指定ID或处理器，取消该事件的所有订阅
      this.logger.debug?.(`[MCP Events] Unsubscribing all handlers for event: ${event}`)
      this.subscriptions.delete(event)
      return
    }

    if (typeof subscriptionIdOrHandler === 'string') {
      // 通过ID取消特定订阅
      this.logger.debug?.(`[MCP Events] Unsubscribing handler with ID ${subscriptionIdOrHandler} for event: ${event}`)
      handlers.delete(subscriptionIdOrHandler)
    }
    else {
      // 通过处理函数取消订阅
      this.logger.debug?.(`[MCP Events] Unsubscribing handler for event: ${event}`)

      // 查找处理函数对应的订阅ID
      for (const [id, handler] of handlers.entries()) {
        if (handler === subscriptionIdOrHandler) {
          handlers.delete(id)
          break
        }
      }
    }

    // 如果该事件没有处理器了，删除事件条目
    if (handlers.size === 0) {
      this.subscriptions.delete(event)
    }
  }

  /**
   * 取消所有事件订阅
   */
  public unsubscribeAll(): void {
    this.logger.debug?.('[MCP Events] Unsubscribing from all events')
    this.subscriptions.clear()
  }

  /**
   * 发送事件消息
   * @param event 事件名称
   * @param data 事件数据
   * @param options 事件选项（作用域和目标）
   */
  public emit(
    event: string,
    scope: EventScope = 'global',
    target: string | undefined = undefined,
    data?: any,
  ): void {
    if (!this.connection.isConnected()) {
      this.logger.warn(`[MCP Events] Cannot emit event ${event}: not connected`)
      return
    }

    const message: EventMessage = {
      id: nanoid(),
      type: 'event',
      event,
      payload: data,
      timestamp: Date.now(),
      version: '1.0',
      scope,
      target,
    }

    this.logger.debug?.(`[MCP Events] Emitting event: ${event}`, data)
    this.socket.emit('event', message)
  }

  /**
   * 发送全局事件
   */
  public emitGlobal(event: string, data?: any): void {
    this.emit(event, data, 'global')
  }

  /**
   * 发送房间事件
   */
  public emitToRoom(roomId: string, event: string, data?: any): void {
    this.emit(event, data, 'room', roomId)
  }

  /**
   * 发送用户事件
   */
  public emitToUser(userId: string, event: string, data?: any): void {
    this.emit(event, data, 'user', userId)
  }
}
