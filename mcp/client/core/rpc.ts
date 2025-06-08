import type { Logger } from 'mcp/shared/logger'
import type { RpcRegisterMessage, RpcRegisterMessageResponse } from 'mcp/shared/protocols/rpc'
import type { Socket } from 'socket.io-client'
import type { Connection } from './connection'
import type { MessageHandler } from './message-handler'
import { nanoid } from 'nanoid'

export class Rpc {
  socket: Socket
  rpcHandlers: Map<string, (params: any) => Promise<any>> = new Map()
  constructor(
    private connection: Connection,
    private messageHandler: MessageHandler,
    private logger: Logger,
  ) {
    this.socket = connection.getSocket()

    this.messageHandler.registerResponseHandler(
      'system-register-rpc-response',
      (response: RpcRegisterMessageResponse) => response.id,
      (response: RpcRegisterMessageResponse) => {
        return response.success
      },
      (response: RpcRegisterMessageResponse) => response?.error?.message || null,
    )
  }

  /**
   * 注册RPC方法
   * @param methodName 方法名
   * @param handler 处理函数
   * @example
   * ```ts
   * rpc.register('getUser', async (params) => {
   *   // 处理逻辑
   *   return { id: 1, name: 'John Doe' }
   * })
   * ```
   */
  async register(serviceId: string, methodName: string, handler: (params: any) => Promise<any>) {
    if (this.rpcHandlers.has(methodName)) {
      this.logger.warn(`[MCP Rpc] Method ${methodName} is already registered, overwriting`)
    }
    this.rpcHandlers.set(methodName, handler)

    const id = nanoid()

    const data: RpcRegisterMessage = {
      id,
      type: 'rpc',
      version: '1.0',
      methods: [methodName],
      serviceId,
      timestamp: Date.now(),
    }

    this.logger.info(`[MCP Rpc] Registering RPC method ${methodName} for service ${serviceId}`)

    return await this.messageHandler.sendRequest<boolean>('system-register-rpc', data)
  }
}
