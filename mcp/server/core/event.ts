import type { RoomRequest, RoomResponse } from 'mcp/shared/room'
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

      // 当客户端认证/关联用户ID时
      socket.on('authenticate', (userId: string) => {
        this.associateUserWithSocket(userId, socket.id)
      })

      // 处理房间相关请求
      this.setupRoomHandlers(socket)

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

  /**
   * 设置房间相关事件处理器
   */
  private setupRoomHandlers(socket: Socket) {
    // 加入房间请求
    socket.on('join-room', (request: RoomRequest) => {
      this.handleJoinRoom(socket, request)
    })

    // 离开房间请求
    socket.on('leave-room', (roomId: string) => {
      this.handleLeaveRoom(socket, roomId)
    })

    // 获取房间成员请求
    socket.on('get-room-members', (roomId: string, callback: (members: string[]) => void) => {
      this.getRoomMembers(roomId)
        .then(members => callback(members))
        .catch((error) => {
          this.logger.error(`[MCP EventManager] Error getting room members: ${error}`)
          callback([])
        })
    })

    // 获取用户所在的所有房间
    socket.on('get-user-rooms', (callback: (rooms: string[]) => void) => {
      this.getUserRooms(socket.id)
        .then(rooms => callback(rooms))
        .catch((error) => {
          this.logger.error(`[MCP EventManager] Error getting user rooms: ${error}`)
          callback([])
        })
    })
  }

  /**
   * 处理加入房间请求
   */
  private handleJoinRoom(socket: Socket, request: RoomRequest) {
    // 加入房间
    socket.join(request.roomId)
    this.logger.debug?.(`[MCP EventManager] Socket ${socket.id} joined room ${roomId}`)

    const timestamp = Date.now()
    // 发送通知给房间内其他成员
    const joinMessage: EventMessage = {
      id: request.id,
      type: 'event',
      event: 'room:user-joined',
      payload: {
        socketId: socket.id,
        roomId: request.roomId,
        timestamp,
      },
      scope: 'room',
      target: request.roomId,
      timestamp,
      version: '1.0',
    }

    // 只发送给房间内的其他成员
    socket.to(request.roomId).emit('room:user-joined', joinMessage)

    const successMessage: RoomResponse = {
      id: request.id,
      success: true,
      roomId: request.roomId,
      timestamp,
    }

    socket.emit('room-join-response', successMessage)
  }

  /**
   * 处理离开房间请求
   */
  private handleLeaveRoom(socket: Socket, roomId: string) {
    // 先检查用户是否在该房间
    if (!socket.rooms.has(roomId)) {
      this.logger.warn(`[MCP EventManager] Socket ${socket.id} tried to leave room ${roomId} but is not in it`)
      return
    }

    // 发送通知给房间内其他成员
    const leaveMessage: EventMessage = {
      id: Date.now().toString(),
      type: 'event',
      event: 'room:user-left',
      payload: {
        socketId: socket.id,
        roomId,
        timestamp: Date.now(),
      },
      scope: 'room',
      target: roomId,
      timestamp: Date.now(),
      version: '1.0',
    }

    // 先发通知，再离开
    socket.to(roomId).emit('event', leaveMessage)

    // 离开房间
    socket.leave(roomId)
    this.logger.debug?.(`[MCP EventManager] Socket ${socket.id} left room ${roomId}`)

    // 发送离开成功事件给用户
    const successMessage: EventMessage = {
      id: Date.now().toString(),
      type: 'event',
      event: 'room:leave-success',
      payload: {
        roomId,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      version: '1.0',
    }

    socket.emit('event', successMessage)
  }

  /**
   * 获取房间的所有成员Socket ID
   * @param roomId 房间ID
   * @returns 房间内所有socket ID的数组
   */
  public async getRoomMembers(roomId: string): Promise<string[]> {
    try {
      // Socket.IO v4+
      const sockets = await this.io.in(roomId).fetchSockets()
      return sockets.map(socket => socket.id)
    }
    catch (error) {
      this.logger.error(`[MCP EventManager] Error fetching room members for ${roomId}:`, error)
      return []
    }
  }

  /**
   * 获取房间成员数量
   * @param roomId 房间ID
   */
  public async getRoomSize(roomId: string): Promise<number> {
    try {
      const sockets = await this.io.in(roomId).fetchSockets()
      return sockets.length
    }
    catch (error) {
      this.logger.error(`[MCP EventManager] Error fetching room size for ${roomId}:`, error)
      return 0
    }
  }

  /**
   * 获取用户所在的所有房间
   * @param socketId Socket ID
   * @returns 用户所在的房间ID数组
   */
  public async getUserRooms(socketId: string): Promise<string[]> {
    const socket = this.io.sockets.sockets.get(socketId)
    if (!socket)
      return []

    // 过滤掉socket自己的ID（在Socket.IO中，每个socket自动加入以自己ID命名的房间）
    return Array.from(socket.rooms).filter(room => room !== socketId)
  }

  /**
   * 检查用户是否在房间中
   * @param socketId Socket ID
   * @param roomId 房间ID
   */
  public async isInRoom(socketId: string, roomId: string): Promise<boolean> {
    const socket = this.io.sockets.sockets.get(socketId)
    if (!socket)
      return false

    return socket.rooms.has(roomId)
  }

  /**
   * 创建一个新房间并邀请用户加入
   * @param creatorSocketId 创建者Socket ID
   * @param roomId 房间ID（可选，不提供则自动生成）
   * @param invitedUsers 要邀请的用户ID数组
   */
  public async createRoom(
    creatorSocketId: string,
    roomId: string = `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    invitedUsers: string[] = [],
  ): Promise<string> {
    // 让创建者加入房间
    await this.joinRoom(creatorSocketId, roomId)

    // 发送邀请给指定用户
    for (const userId of invitedUsers) {
      this.sendRoomInvitation(creatorSocketId, userId, roomId)
    }

    this.logger.debug?.(`[MCP EventManager] Room ${roomId} created by ${creatorSocketId}`)
    return roomId
  }

  /**
   * 向用户发送房间邀请
   */
  public sendRoomInvitation(fromSocketId: string, toUserId: string, roomId: string): void {
    this.sendToUser(toUserId, 'room:invitation', {
      fromSocketId,
      roomId,
      timestamp: Date.now(),
    })
  }

  /**
   * 清空房间（使所有成员离开）
   * @param roomId 房间ID
   * @param reason 清空原因
   */
  public async clearRoom(roomId: string, reason = 'Room cleared by server'): Promise<void> {
    try {
      const sockets = await this.io.in(roomId).fetchSockets()

      // 先通知所有成员房间被清空
      this.broadcastToRoom(roomId, 'room:cleared', {
        roomId,
        reason,
        timestamp: Date.now(),
      })

      // 然后让所有成员离开房间
      for (const socket of sockets) {
        socket.leave(roomId)
      }

      this.logger.debug?.(`[MCP EventManager] Cleared room ${roomId}, ${sockets.length} members removed`)
    }
    catch (error) {
      this.logger.error(`[MCP EventManager] Error clearing room ${roomId}:`, error)
    }
  }

  /**
   * 获取所有活跃房间列表
   * @returns 所有有至少一个成员的房间ID数组
   */
  public async getActiveRooms(): Promise<string[]> {
    try {
      // 这个实现依赖于 Socket.IO 的内部实现，可能随版本变化
      // 对于 Socket.IO v4+，我们需要遍历所有socket查找唯一的房间
      const rooms = new Set<string>()
      const sockets = await this.io.fetchSockets()

      for (const socket of sockets) {
        for (const room of socket.rooms) {
          // 排除socket自己的ID（在Socket.IO中，每个socket自动加入以自己ID命名的房间）
          if (room !== socket.id) {
            rooms.add(room)
          }
        }
      }

      return Array.from(rooms)
    }
    catch (error) {
      this.logger.error('[MCP EventManager] Error fetching active rooms:', error)
      return []
    }
  }

  /**
   * 将用户从所有房间中移除
   * @param socketId Socket ID
   */
  public async removeUserFromAllRooms(socketId: string): Promise<void> {
    const rooms = await this.getUserRooms(socketId)
    const socket = this.io.sockets.sockets.get(socketId)

    if (!socket) {
      this.logger.warn(`[MCP EventManager] Cannot find socket ${socketId} to remove from rooms`)
      return
    }

    for (const roomId of rooms) {
      // 发送通知给房间内其他成员
      socket.to(roomId).emit('event', {
        id: Date.now().toString(),
        type: 'event',
        event: 'room:user-left',
        payload: {
          socketId,
          roomId,
          timestamp: Date.now(),
        },
        scope: 'room',
        target: roomId,
        timestamp: Date.now(),
        version: '1.0',
      })

      // 离开房间
      socket.leave(roomId)
    }

    this.logger.debug?.(`[MCP EventManager] Removed socket ${socketId} from ${rooms.length} rooms`)
  }
}
