import type { Socket, Server as SocketIOServer } from 'socket.io'
import type { Logger } from '../../shared/logger'
import type { EventMessage } from '../../shared/protocols/event'

export class EventManager {
  private io: SocketIOServer
  private logger: Logger

  // 用于存储用户ID到Socket ID的映射
  private userSocketMap = new Map<string, Set<string>>()

  constructor(io: SocketIOServer, logger: Logger) {
    this.io = io
    this.logger = logger

    this.setupEventHandlers()
  }

  /**
   * 设置全局事件处理器
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      // 当收到客户端的事件消息时
      socket.on('event', (message: EventMessage) => {
        this.handleEventMessage(socket, message)
      })

      // 当客户端认证/关联用户ID时
      socket.on('authenticate', (userId: string) => {
        this.associateUserWithSocket(userId, socket.id)
      })

      // 当客户端断开连接时
      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })
    })
  }

  /**
   * 处理客户端发来的事件消息
   */
  private handleEventMessage(socket: Socket, message: EventMessage) {
    const { event, payload, scope, target } = message

    this.logger.debug?.(`[MCP EventManager] Received event ${event} from ${socket.id}`, message)

    // 根据作用域转发事件
    switch (scope) {
      case 'global':
        // 全局广播
        this.broadcastGlobal(event, payload, socket.id)
        break

      case 'room':
        // 房间广播
        if (target) {
          this.broadcastToRoom(target, event, payload, socket.id)
        }
        else {
          this.logger.warn(`[MCP EventManager] Room event without target: ${event}`)
        }
        break

      case 'user':
        // 发送给特定用户
        if (target) {
          this.sendToUser(target, event, payload)
        }
        else {
          this.logger.warn(`[MCP EventManager] User event without target: ${event}`)
        }
        break

      default:
        // 默认为本地事件，不转发
        this.logger.debug?.(`[MCP EventManager] Local event: ${event}`)
        break
    }
  }

  /**
   * 处理客户端断开连接
   */
  private handleDisconnect(socket: Socket) {
    // 清理用户与socket的关联
    for (const [userId, socketIds] of this.userSocketMap.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id)
        if (socketIds.size === 0) {
          this.userSocketMap.delete(userId)
        }
        break
      }
    }
  }

  /**
   * 关联用户ID与Socket ID
   */
  public associateUserWithSocket(userId: string, socketId: string) {
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set())
    }

    this.userSocketMap.get(userId)!.add(socketId)
    this.logger.debug?.(`[MCP EventManager] Associated user ${userId} with socket ${socketId}`)
  }

  /**
   * 全局广播事件（可选排除发送者）
   */
  public broadcastGlobal(event: string, data: any, excludeSocketId?: string) {
    const message: EventMessage = {
      id: Date.now().toString(),
      type: 'event',
      event,
      payload: data,
      scope: 'global',
      timestamp: Date.now(),
      version: '1.0',
    }

    this.logger.debug?.(`[MCP EventManager] Broadcasting global event: ${event}`)

    if (excludeSocketId) {
      // 广播给除发送者外的所有客户端
      this.io.except(excludeSocketId).emit('event', message)
    }
    else {
      // 广播给所有客户端
      this.io.emit('event', message)
    }
  }

  /**
   * 向特定房间广播事件
   */
  public broadcastToRoom(roomId: string, event: string, data: any, excludeSocketId?: string) {
    const message: EventMessage = {
      id: Date.now().toString(),
      type: 'event',
      event,
      payload: data,
      scope: 'room',
      target: roomId,
      timestamp: Date.now(),
      version: '1.0',
    }

    this.logger.debug?.(`[MCP EventManager] Broadcasting to room ${roomId}, event: ${event}`)

    if (excludeSocketId) {
      // 广播给房间内除发送者外的所有客户端
      this.io.to(roomId).except(excludeSocketId).emit('event', message)
    }
    else {
      // 广播给房间内所有客户端
      this.io.to(roomId).emit('event', message)
    }
  }

  /**
   * 向特定用户发送事件
   */
  public sendToUser(userId: string, event: string, data: any) {
    const socketIds = this.userSocketMap.get(userId)
    if (!socketIds || socketIds.size === 0) {
      this.logger.warn(`[MCP EventManager] Cannot send event to user ${userId}: no active connections`)
      return
    }

    const message: EventMessage = {
      id: Date.now().toString(),
      type: 'event',
      event,
      payload: data,
      scope: 'user',
      target: userId,
      timestamp: Date.now(),
      version: '1.0',
    }

    this.logger.debug?.(`[MCP EventManager] Sending event to user ${userId}, event: ${event}`)

    // 发送给用户的所有活动连接
    for (const socketId of socketIds) {
      this.io.to(socketId).emit('event', message)
    }
  }

  /**
   * 使用户加入房间
   */
  public joinRoom(socketId: string, roomId: string) {
    const socket = this.io.sockets.sockets.get(socketId)
    if (socket) {
      socket.join(roomId)
      this.logger.debug?.(`[MCP EventManager] Socket ${socketId} joined room ${roomId}`)
    }
    else {
      this.logger.warn(`[MCP EventManager] Cannot find socket ${socketId} to join room ${roomId}`)
    }
  }

  /**
   * 使用户离开房间
   */
  public leaveRoom(socketId: string, roomId: string) {
    const socket = this.io.sockets.sockets.get(socketId)
    if (socket) {
      socket.leave(roomId)
      this.logger.debug?.(`[MCP EventManager] Socket ${socketId} left room ${roomId}`)
    }
    else {
      this.logger.warn(`[MCP EventManager] Cannot find socket ${socketId} to leave room ${roomId}`)
    }
  }
}
