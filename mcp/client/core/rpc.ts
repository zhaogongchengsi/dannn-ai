import type { Logger } from 'mcp/shared/logger'
import type { RpcRegisterMessage, RpcRegisterMessageResponse, RpcRequest, RpcResponse } from 'mcp/shared/protocols/rpc'
import type { Socket } from 'socket.io-client'
import type { Connection } from './connection'
import type { MessageHandler } from './message-handler'
import { nanoid } from 'nanoid'

export class Rpc {
  socket: Socket
  rpcHandlers: Map<string, (...params: any[]) => Promise<any>> = new Map()
  private id: string
  constructor(
    private connection: Connection,
    private messageHandler: MessageHandler,
    private logger: Logger,
  ) {
    this.socket = connection.getSocket()
    this.id = this.socket.id || nanoid()

    this.messageHandler.registerResponseHandler(
      'system-register-rpc-response',
      (response: RpcRegisterMessageResponse) => response.id,
      (response: RpcRegisterMessageResponse) => {
        return response.success
      },
      (response: RpcRegisterMessageResponse) => response?.error?.message || null,
    )

    this.messageHandler.registerResponseHandler(
      'system-rpc-response',
      (response: RpcResponse) => response.id,
      (response: RpcResponse) => {
        return response.result
      },
      (response: RpcResponse) => response?.error?.message || null,
    )

    // 处理来自服务端调用方法的请求
    this.socket.on('system-rpc-call', async (request: RpcRequest) => {
      this.handleRpcCall(request)
    })
  }

  private async handleRpcCall(request: RpcRequest): Promise<any> {
    const { method, params, id, from } = request

    const sendResponse = (result?: any, error?: any) => {
      const response: RpcResponse = {
        id,
        type: 'rpc',
        version: '1.0',
        result,
        from: this.id,
        to: from, // 回复给请求者
        error: error ? { message: error.message } : undefined,
        timestamp: Date.now(),
      }

      this.socket.emit('system-rpc-response', response)
    }

    try {
      if (!method) {
        this.logger.warn(`[MCP Rpc] Call request from ${from} is missing method name`)
        sendResponse(undefined, new Error('Method name is required'))
        return
      }

      if (!this.rpcHandlers.has(method)) {
        this.logger.warn(`[MCP Rpc] Method ${method} not found for request from ${from}`)
        sendResponse(undefined, new Error(`Method ${method} not found`))
        return
      }
      const handler = this.rpcHandlers.get(method)
      if (handler) {
        const _params: any[] = Array.isArray(params) ? params : [params]
        const result = await Promise.resolve(handler(..._params))
        this.logger.info(`[MCP Rpc] Successfully handled RPC call for method ${method} from ${from}`)
        sendResponse(result)
      }
    }
    catch (error: any) {
      this.logger.error(`[MCP Rpc] Error handling RPC call for method ${method}:`, error)
      sendResponse(undefined, error instanceof Error ? error : new Error(error.message ?? 'Unknown error'))
    }
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
  async register(methodName: string, handler: (params: any) => Promise<any>) {
    if (this.rpcHandlers.has(methodName)) {
      this.logger.warn(`[MCP Rpc] Method ${methodName} is already registered, overwriting`)
    }
    this.rpcHandlers.set(methodName, handler)

    const id = nanoid()

    const data: RpcRegisterMessage = {
      id,
      type: 'rpc',
      version: '1.0',
      method: methodName,
      providerId: this.id,
      timestamp: Date.now(),
    }

    this.logger.info(`[MCP Rpc] Registering RPC method ${methodName}`)

    return await this.messageHandler.sendRequest<boolean>('system-register-rpc', data)
  }

  async call<T>(methodName: string, params: any[]): Promise<T> {
    const request: RpcRequest = {
      id: nanoid(),
      type: 'rpc',
      version: '1.0',
      method: methodName,
      params,
      timestamp: Date.now(),
      from: this.socket.id || 'unknown',
      to: '*', // 使用 '*' 进行广播调用
    }

    return this.messageHandler.sendRequest<T>('system-rpc-call', request)
  }
}
