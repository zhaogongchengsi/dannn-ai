import type { Server, Socket } from 'socket.io'
import type { Logger } from '../../shared/logger'
import type {
  RpcRegisterMessage,
  RpcRegisterMessageResponse,
  RpcRequest,
  RpcResponse,
} from '../../shared/protocols/rpc'
import type { ConnectionServer } from './connection'

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

      // 处理客户端断开连接
      socket.on('disconnect', () => {
        this.handleClientDisconnect(socket.id)
      })
    })

    this.logger.info('[MCP RPC] RPC Manager initialized')
  }

  /**
   * 处理 RPC 方法注册请求
   * 这个方法将在后面实现
   */
  private handleRegisterRpc(socket: Socket, request: RpcRegisterMessage): void {
    const { id, methods, serviceId } = request

    if (!methods || methods.length === 0) {
      this.logger.warn(`[MCP RPC] Service ${serviceId} registered with no methods`)
      return
    }

    // 注册每个方法到 methodRegistry
    for (const method of methods) {
      if (this.methodRegistry.has(method)) {
        this.logger.warn(`[MCP RPC] Method ${method} already registered by ${this.methodRegistry.get(method)}`)
      }
      this.methodRegistry.set(method, socket.id)
    }

    // 发送注册响应
    const response: RpcRegisterMessageResponse = {
      id,
      type: 'rpc',
      version: '1.0',
      success: true,
      serviceId,
      timestamp: Date.now(),
    }

    socket.emit('system-register-rpc-response', response)
    this.logger.info(`[MCP RPC] Service ${serviceId} registered with methods: ${methods.join(', ')}`)
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
