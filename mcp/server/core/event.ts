import type { RoomRequest, RoomResponse } from 'mcp/shared/protocols/room'
import type { Socket, Server as SocketIOServer } from 'socket.io'
import type { Logger } from '../../shared/logger'
import type { EventMessage } from '../../shared/protocols/event'
import type { ConnectionServer } from './connection'

export class EventManager {
  private io: SocketIOServer
  private logger: Logger

  connection: ConnectionServer
  // 用于存储用户ID到Socket ID的映射
  private userSocketMap = new Map<string, Set<string>>()

  constructor(connection: ConnectionServer, logger: Logger) {
    this.io = connection.getSocketServer()
    this.connection = connection
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

      socket.on('room-join', (request: RoomRequest) => {
        this.handleJoinRoom(socket, request)
      })

      // 当客户端认证/关联用户ID时
      socket.on('authenticate', (userId: string) => {
        this.associateUserWithSocket(userId, socket.id)
      })

      socket.on('room-leave', (request: RoomRequest) => {
        this.handleRoomLeave(socket, request)
      })
      // 处理房间相关请求
      // this.setupRoomHandlers(socket)

      // 当客户端断开连接时
      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })
    })
  }

  private handleRoomLeave(socket: Socket, request: RoomRequest) {
    this.logger.debug?.(`[MCP EventManager] Room leave request from ${socket.id}`, request)

    // 处理房间离开逻辑
    const roomId = request.roomId
    if (roomId) {
      socket.leave(roomId)

      // 响应客户端
      const response: RoomResponse = {
        id: request.id,
        success: true,
        roomId,
        timestamp: Date.now(),
      }

      socket.emit('room-leave-response', response)
    }
    else {
      // 如果没有提供房间ID，返回错误
      const errorResponse: RoomResponse = {
        id: request.id,
        success: false,
        roomId: '',
        error: 'Room ID is required to leave a room',
        timestamp: Date.now(),
      }

      socket.emit('room-leave-response', errorResponse)
    }
  }

  private handleJoinRoom(socket: Socket, request: RoomRequest) {
    this.logger.debug?.(`[MCP EventManager] Room join request from ${socket.id}`, request)

    // 处理房间加入逻辑
    const roomId = request.roomId || `room-${Date.now()}`
    socket.join(roomId)

    // 响应客户端
    const response: RoomResponse = {
      id: request.id,
      success: true,
      roomId,
      timestamp: Date.now(),
    }

    socket.emit('room-join-response', response)
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
}
