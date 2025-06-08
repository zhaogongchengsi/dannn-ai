import type { Server, Socket } from 'socket.io'
import type { Logger } from '../../shared/logger'
import type {
  RpcRegisterMessage,
  RpcRegisterMessageResponse,
  RpcRequest,
  RpcResponse,
} from '../../shared/protocols/rpc'
import type { ConnectionServer } from './connection'
import { handleHotUpdate } from 'vue-router/auto-routes'

/**
 * RPC 管理器
 * 负责处理服务端的 RPC 请求路由和服务注册
 */
export class RpcManager {
  private connection: ConnectionServer
  private io: Server
  private logger: Logger

  // 方法注册表 methodName -> providerId (Socket ID)
  private methodRegistry: Map<string, string> = new Map()

  constructor(connection: ConnectionServer, logger?: Logger) {
    this.connection = connection
    this.io = this.connection.getSocketServer()
    this.logger = logger || console
    this.initialize()
  }

  /**
   * 初始化 RPC 管理器
   * 设置必要的事件监听器
   */
  public initialize(): void {
    // 为每个新连接设置 RPC 处理器
    this.io.on('connection', (socket: Socket) => {
      // 处理 RPC 方法注册请求
      socket.on('system-register-rpc', (request: RpcRegisterMessage) => {
        this.handleRegisterRpc(socket, request)
      })

      // 处理 RPC 调用请求
      socket.on('system-rpc-call', (request: RpcRequest) => {
        this.handleRpcCall(socket, request)
      })

      // 处理 RPC 响应请求
      socket.on('system-rpc-response', (response: RpcResponse) => {
        this.handleRpcResponse(response)
      })

      // 处理客户端断开连接
      socket.on('disconnect', () => {
        this.handleClientDisconnect(socket.id)
      })
    })

    this.logger.info('[MCP RPC] RPC Manager initialized')
  }

  // 处理 RPC 响应 将结果转发给请求者
  private handleRpcResponse(response: RpcResponse) {
    const { id, to } = response
    if (!id || !to) {
      this.logger.warn(`[MCP RPC] Response from ${id} is missing id or to field`)
      return
    }

    // 回复给请求者
    const requesterSocket = this.io.sockets.sockets.get(to)
    if (requesterSocket) {
      requesterSocket.emit('system-rpc-response', response)
    }
    else {
      this.logger.warn(`[MCP RPC] Requester socket ${to} not found for response`)
    }
  }

  handleRpcCall(socket: Socket, request: RpcRequest): void {
    const { method, id, from, to } = request

    if (!method) {
      this.logger.warn(`[MCP RPC] Call request from ${socket.id} is missing method name`)
      this.handleRpcResponse({
        type: 'rpc',
        id,
        from,
        to,
        result: null,
        error: {
          code: 400,
          message: 'Method name is required',
        },
        timestamp: Date.now(),
      })
      return
    }

    // 检查方法是否已注册
    if (!this.methodRegistry.has(method)) {
      this.logger.warn(`[MCP RPC] Method ${method} is not registered`)
      const response: RpcResponse = {
        id,
        type: 'rpc',
        version: '1.0',
        error: {
          code: 404,
          message: `Method ${method} not found`,
        },
        to, // 回复给请求者
        from,
        timestamp: Date.now(),
      }
      this.handleRpcResponse(response)
      return
    }

    const providerId = this.methodRegistry.get(method)
    if (!providerId) {
      this.logger.error(`[MCP RPC] Provider ID for method ${method} not found`)
      return
    }

    // 发送请求到对应的提供者
    const providerSocket = this.io.sockets.sockets.get(providerId)
    if (!providerSocket) {
      this.logger.error(`[MCP RPC] Provider socket ${providerId} not found`)
      return
    }

    providerSocket.emit('system-rpc-call', request)
  }

  /**
   * 处理 RPC 方法注册请求
   * 这个方法将在后面实现
   */
  private handleRegisterRpc(socket: Socket, request: RpcRegisterMessage): void {
    const { id, method } = request

    if (!method) {
      this.logger.warn(`[MCP RPC] Register request from ${socket.id} is missing method name`)
      return
    }

    if (this.methodRegistry.has(method)) {
      this.logger.warn(`[MCP RPC] Method ${method} already registered by ${this.methodRegistry.get(method)}`)
    }
    this.methodRegistry.set(method, socket.id)

    // 发送注册响应
    const response: RpcRegisterMessageResponse = {
      id,
      type: 'rpc',
      version: '1.0',
      success: true,
      timestamp: Date.now(),
    }

    socket.emit('system-register-rpc-response', response)
    this.logger.info(`[MCP RPC] Method ${method} registered by ${socket.id}`)
  }

  /**
   * 处理客户端断开连接
   * 这个方法将在后面实现
   */
  private handleClientDisconnect(socketId: string): void {
    // 从 methodRegistry 中移除所有与该 socketId 关联的方法
    for (const [method, providerId] of this.methodRegistry.entries()) {
      if (providerId === socketId) {
        this.methodRegistry.delete(method)
        this.logger.info(`[MCP RPC] Method ${method} unregistered due to socket disconnect: ${socketId}`)
      }
    }
  }
}
