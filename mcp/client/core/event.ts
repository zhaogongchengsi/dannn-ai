import type { Socket } from 'socket.io-client'
import type { Logger } from '../../shared/logger'
import type { AuthenticateRequest, EventMessage, EventScope } from '../../shared/protocols/event'
import type { CreateRoomRequest, CreateRoomResponse, GetRoomMembersResponse, GetUserRoomsResponse, RoomRequest, RoomResponse } from '../../shared/protocols/room'
import type { Connection } from './connection'
import type { MessageHandler } from './message-handler'
import { nanoid } from 'nanoid'

// 房间操作相关的请求和响应类型

type EventHandler<T = any> = (data: T) => void

export class Events {
  private subscriptions = new Map<string, Map<string, EventHandler>>()
  private socket: Socket
  private logger: Logger
  private messageHandler: MessageHandler

  constructor(private connection: Connection, messageHandler: MessageHandler, logger: Logger) {
    this.socket = connection.getSocket()
    this.logger = logger
    this.messageHandler = messageHandler

    // 监听所有事件消息
    this.socket.on('event', (message: EventMessage) => {
      this.handleEventMessage(message)
    })

    // 注册房间操作的响应处理器
    this.registerRoomResponseHandlers()
  }

  async authenticate(token: string) {
    if (!this.connection.isConnected()) {
      this.logger.warn(`[MCP Events] Cannot authenticate: not connected`)
      return false
    }

    console.debug(`[MCP Events] Authenticating with token: ${token}`)

    const request: AuthenticateRequest = {
      id: nanoid(),
      userId: token,
      timestamp: Date.now(),
    }
    
    return await this.messageHandler.sendRequest<boolean>(
      'authenticate',
      request,
      5000, // 5秒超时
    )
  }

  deauthenticate(): void | PromiseLike<void> {
    if (!this.connection.isConnected()) {
      this.logger.warn(`[MCP Events] Cannot deauthenticate: not connected`)
      return
    }

    console.debug(`[MCP Events] Deauthenticating`)
    this.socket.emit('deauthenticate')
  }



  /**
   * 注册房间操作的响应处理器
   */
  private registerRoomResponseHandlers() {
    // 加入房间响应
    this.messageHandler.registerResponseHandler(
      'room-join-response',
      (response: RoomResponse) => response.id,
      (response: RoomResponse) => response.success,
      (response: RoomResponse) => response.error || null,
    )

    // 离开房间响应
    this.messageHandler.registerResponseHandler(
      'room-leave-response',
      (response: RoomResponse) => response.id,
      (response: RoomResponse) => response.success,
      (response: RoomResponse) => response.error || null,
    )

    // 获取房间成员响应
    this.messageHandler.registerResponseHandler(
      'room-members-response',
      (response: GetRoomMembersResponse) => response.id,
      (response: GetRoomMembersResponse) => response.members,
      (response: GetRoomMembersResponse) => response.error || null,
    )

    // 获取用户房间响应
    this.messageHandler.registerResponseHandler(
      'user-rooms-response',
      (response: GetUserRoomsResponse) => response.id,
      (response: GetUserRoomsResponse) => response.rooms,
      (response: GetUserRoomsResponse) => response.error || null,
    )

    // 创建房间响应
    this.messageHandler.registerResponseHandler(
      'room-create-response',
      (response: CreateRoomResponse) => response.id,
      (response: CreateRoomResponse) => response.roomId,
      (response: CreateRoomResponse) => response.error || null,
    )

    this.messageHandler.registerResponseHandler(
      'authenticate-response',
      (response: { id: string, success: boolean, error?: string }) => response.id,
      (response: { success: boolean }) => response.success,
      (response: { error?: string }) => response.error || null,
    )
  }

  /**
   * 处理收到的事件消息
   */
  private handleEventMessage(message: EventMessage) {
    const { payload, event } = message

    this.logger.debug?.(`[MCP Events] Received event: ${event}`, message)

    // 获取该事件的所有处理器
    const handlers = this.subscriptions.get(event)
    if (!handlers || handlers.size === 0) {
      return
    }

    const emitList: EventHandler<any>[] = []
    // 调用所有处理器
    handlers.forEach((handler) => {
      try {
        // 如果当前处理器在 emitList 中，跳过，避免重复调用
        if (emitList.includes(handler)) {
          this.logger.warn(`[MCP Events] Skipping recursive call for handler of event: ${event}`)
          return
        }
        // 将当前处理器添加到 emitList，避免递归调用
        emitList.push(handler)
        handler(payload)
      }
      catch (error) {
        this.logger.error(`[MCP Events] Error in event handler for ${event}:`, error)
      }
      finally {
        emitList.pop()
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
   * @param scope 事件作用域
   * @param target 事件目标
   */
  public emit(
    event: string,
    data?: any,
    scope: EventScope = 'global',
    target?: string,
  ): void {
    if (!this.connection.isConnected()) {
      console.warn(`[MCP Events] Cannot emit event ${event}: not connected`)
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

    this.logger.debug?.(`[MCP Events] Emitting event: ${event}`, message)
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

  /**
   * 加入房间
   * @param roomId 要加入的房间ID
   * @returns Promise 表示操作是否成功
   */
  public async joinRoom(roomId: string): Promise<boolean> {
    if (!this.connection.isConnected()) {
      this.logger.warn?.(`[MCP Events] Cannot join room ${roomId}: not connected`)
      return false
    }

    this.logger.debug?.(`[MCP Events] Joining room: ${roomId}`)

    const id = nanoid()
    const request: RoomRequest = {
      id,
      roomId,
      timestamp: Date.now(),
    }

    try {
      const response = await this.messageHandler.sendRequest<RoomResponse>(
        'room-join',
        request,
        5000, // 5秒超时
      )

      if (response.success) {
        this.logger.debug?.(`[MCP Events] Successfully joined room ${roomId}`)
        return true
      }
      else {
        this.logger.warn?.(`[MCP Events] Failed to join room ${roomId}: ${response.error}`)
        return false
      }
    }
    catch (error) {
      this.logger.error(`[MCP Events] Error joining room ${roomId}:`, error)
      return false
    }
  }

  /**
   * 离开房间
   * @param roomId 要离开的房间ID
   * @returns Promise 表示操作是否成功
   */
  public async leaveRoom(roomId: string): Promise<boolean> {
    if (!this.connection.isConnected()) {
      this.logger.warn?.(`[MCP Events] Cannot leave room ${roomId}: not connected`)
      return false
    }

    this.logger.debug?.(`[MCP Events] Leaving room: ${roomId}`)

    const id = nanoid()
    const request: RoomRequest = {
      id,
      roomId,
      timestamp: Date.now(),
    }

    try {
      const response = await this.messageHandler.sendRequest<RoomResponse>(
        'room-leave',
        request,
        5000, // 5秒超时
      )

      if (response.success) {
        this.logger.debug?.(`[MCP Events] Successfully left room ${roomId}`)
        return true
      }
      else {
        this.logger.warn?.(`[MCP Events] Failed to leave room ${roomId}: ${response.error}`)
        return false
      }
    }
    catch (error) {
      this.logger.error(`[MCP Events] Error leaving room ${roomId}:`, error)
      return false
    }
  }

  /**
   * 获取房间成员
   * @param roomId 房间ID
   * @returns 房间成员的Socket ID数组
   */
  public async getRoomMembers(roomId: string): Promise<string[]> {
    if (!this.connection.isConnected()) {
      this.logger.warn?.(`[MCP Events] Cannot get room members: not connected`)
      return []
    }

    const id = nanoid()
    const request: RoomRequest = {
      id,
      roomId,
      timestamp: Date.now(),
    }

    try {
      const response = await this.messageHandler.sendRequest<GetRoomMembersResponse>(
        'room-get-members',
        request,
        5000, // 5秒超时
      )

      if (response.success) {
        return response.members
      }
      else {
        this.logger.warn?.(`[MCP Events] Failed to get room members: ${response.error}`)
        return []
      }
    }
    catch (error) {
      this.logger.error(`[MCP Events] Error getting room members:`, error)
      return []
    }
  }

  /**
   * 获取当前用户所在的所有房间
   * @returns 房间ID数组
   */
  public async getUserRooms(): Promise<string[]> {
    if (!this.connection.isConnected()) {
      this.logger.warn?.(`[MCP Events] Cannot get user rooms: not connected`)
      return []
    }

    const id = nanoid()
    const request = {
      id,
      timestamp: Date.now(),
    }

    try {
      const response = await this.messageHandler.sendRequest<GetUserRoomsResponse>(
        'room-get-user-rooms',
        request,
        5000, // 5秒超时
      )

      if (response.success) {
        return response.rooms
      }
      else {
        this.logger.warn?.(`[MCP Events] Failed to get user rooms: ${response.error}`)
        return []
      }
    }
    catch (error) {
      this.logger.error(`[MCP Events] Error getting user rooms:`, error)
      return []
    }
  }

  /**
   * 创建新房间并邀请用户
   * @param roomId 可选的房间ID
   * @param invitedUsers 要邀请的用户ID数组
   * @returns 创建的房间ID
   */
  public async createRoom(roomId?: string, invitedUsers: string[] = []): Promise<string> {
    if (!this.connection.isConnected()) {
      this.logger.warn?.(`[MCP Events] Cannot create room: not connected`)
      throw new Error('Not connected')
    }

    const id = nanoid()
    const request: CreateRoomRequest = {
      id,
      roomId,
      invitedUsers,
      timestamp: Date.now(),
    }

    try {
      const response = await this.messageHandler.sendRequest<CreateRoomResponse>(
        'room-create',
        request,
        5000, // 5秒超时
      )

      if (response.success) {
        this.logger.debug?.(`[MCP Events] Successfully created room ${response.roomId}`)
        return response.roomId
      }
      else {
        const errorMsg = response.error || 'Unknown error'
        this.logger.warn?.(`[MCP Events] Failed to create room: ${errorMsg}`)
        throw new Error(errorMsg)
      }
    }
    catch (error) {
      this.logger.error(`[MCP Events] Error creating room:`, error)
      throw error
    }
  }

  /**
   * 监听房间内用户加入事件
   * @param roomId 房间ID
   * @param callback 回调函数
   * @returns 订阅ID
   */
  public onUserJoinedRoom(roomId: string, callback: (data: { socketId: string, roomId: string }) => void): string {
    return this.subscribe<{ socketId: string, roomId: string }>('room:user-joined', (data) => {
      if (data.roomId === roomId) {
        callback(data)
      }
    })
  }

  /**
   * 监听房间内用户离开事件
   * @param roomId 房间ID
   * @param callback 回调函数
   * @returns 订阅ID
   */
  public onUserLeftRoom(roomId: string, callback: (data: { socketId: string, roomId: string }) => void): string {
    return this.subscribe<{ socketId: string, roomId: string }>('room:user-left', (data) => {
      if (data.roomId === roomId) {
        callback(data)
      }
    })
  }

  /**
   * 监听房间被清空事件
   * @param callback 回调函数
   * @returns 订阅ID
   */
  public onRoomCleared(callback: (data: { roomId: string, reason: string }) => void): string {
    return this.subscribe<{ roomId: string, reason: string }>('room:cleared', callback)
  }

  /**
   * 监听收到房间邀请
   * @param callback 回调函数
   * @returns 订阅ID
   */
  public onRoomInvitation(callback: (data: { fromSocketId: string, roomId: string }) => void): string {
    return this.subscribe<{ fromSocketId: string, roomId: string }>('room:invitation', callback)
  }
}
