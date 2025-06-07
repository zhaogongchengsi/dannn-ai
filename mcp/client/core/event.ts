import type { Socket } from 'socket.io-client'
import type { Logger } from '../../shared/logger'
import type { Connection } from './connection'

export class Events {
  private subscriptions = new Map<string, Set<(...args: any[]) => void>>()
  logger: Logger
  socket: Socket

  constructor(
    connection: Connection,
    logger: Logger,
  ) {
    this.logger = logger
    this.socket = connection.getSocket()
  }

  /**
   * 订阅事件
   * @param event 事件名
   * @param handler 事件处理函数
   */
  public subscribe<T = any>(event: string, handler: (data: T) => void): void {
    this.logger?.debug?.(`[MCP Events] Subscribing to event: ${event}`)

    // 跟踪订阅，以便之后可以批量取消
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set())
    }
    this.subscriptions.get(event)!.add(handler)

    // 实际订阅
    this.socket.on(event, handler)
  }

  /**
   * 取消订阅事件
   */
  public unsubscribe(event: string, handler?: (...args: any[]) => void): void {
    if (handler) {
      // 取消特定处理程序
      this.logger.debug?.(`[MCP Events] Unsubscribing specific handler from event: ${event}`)
      this.socket.off(event, handler)

      // 更新订阅跟踪
      const handlers = this.subscriptions.get(event)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.subscriptions.delete(event)
        }
      }
    }
    else {
      // 取消所有处理程序
      this.logger.debug?.(`[MCP Events] Unsubscribing all handlers from event: ${event}`)
      this.socket.off(event)
      this.subscriptions.delete(event)
    }
  }

  /**
   * 取消所有订阅
   */
  public unsubscribeAll(): void {
    this.logger?.debug?.('[MCP Events] Unsubscribing from all events')

    for (const [event, handlers] of this.subscriptions.entries()) {
      for (const handler of handlers) {
        this.socket.off(event, handler)
      }
    }

    this.subscriptions.clear()
  }

  /**
   * 发送事件消息
   */
  public emit(event: string, data: any): void {
    this.logger.debug?.(`[MCP Events] Emitting event: ${event}`, data)
    this.socket.emit(event, data)
  }
}
