import type { McpMessage } from 'mcp/shared/protocols'
import type { Socket } from 'socket.io-client'
import type { Logger } from '../shared/logger' // 你自己定义的 Logger 接口
import type {
  RegisterServiceMessage,
  ServiceListRequest,
  ServiceListResponse,
  ServiceRegistrationResponse,
} from '../shared/protocols/discovery'
import { withResolvers, withTimeout } from '@zunh/promise-kit'
import { nanoid } from 'nanoid'
import { io } from 'socket.io-client'

export interface ClientConfig {
  url: string
  logger?: Logger
}

export class McpClient {
  private socket: Socket
  private logger: Logger
  private connected: boolean = false
  funcMap: Map<string, PromiseWithResolvers<any>> = new Map()

  constructor(private config: ClientConfig) {
    this.logger = config.logger ?? console
    this.socket = io(config.url, {
      autoConnect: false,
      transports: ['websocket'],
    })
    this.registerDefaultHandlers()
  }

  private registerDefaultHandlers() {
    this.socket.on('connect', () => {
      this.connected = true
      this.logger.info(`[MCP Client] Connected to ${this.config.url}`)
    })

    this.socket.on('disconnect', () => {
      this.connected = false
      this.logger.info('[MCP Client] Disconnected')
    })

    this.socket.on('connect_error', (err) => {
      this.logger.error('[MCP Client] Connection error:', err)
    })

    this.socket.on('system-get-services-response', this.onSystemServiceListResponse.bind(this))
    this.socket.on('system-registered-response', this.systemRegisteredResponse.bind(this))
  }

  public async connect(): Promise<void> {
    if (this.connected)
      return
    return new Promise((resolve, reject) => {
      this.socket.connect()
      this.socket.once('connect', () => resolve())
      this.socket.once('connect_error', reject)
    })
  }

  public async disconnect(): Promise<void> {
    if (!this.connected)
      return
    return new Promise((resolve) => {
      this.socket.once('disconnect', () => resolve())
      this.socket.disconnect()
    })
  }

  /**
   * 发送 RPC 调用
   * @param method RPC 方法名
   * @param params 参数
   * @returns RPC 响应结果 Promise
   */
  public callRpc<T = any>(method: string, params: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.socket.timeout(5000).emit('rpc', { method, params }, (err: any, result: T) => {
        if (err)
          return reject(err)
        resolve(result)
      })
    })
  }

  /**
   * 订阅事件
   * @param event 事件名
   * @param handler 事件处理函数
   */
  public onEvent<T = any>(event: string, handler: (data: T) => void) {
    this.socket.on(event, handler)
  }

  /**
   * 取消订阅事件
   */
  public offEvent(event: string, handler?: (...args: any[]) => void) {
    this.socket.off(event, handler)
  }

  /**
   * 发送事件消息
   */
  public emitEvent(event: string, data: any) {
    this.socket.emit(event, data)
  }

  public isConnected() {
    return this.connected
  }

  /**
   * 注册一个服务
   */
  public async registerService(serviceId: string, methods: string[], metadata?: Record<string, any>) {
    const promiser = withResolvers<ServiceListResponse['services']>()
    const id = nanoid()
    const message: RegisterServiceMessage = {
      id,
      type: 'system',
      action: 'register',
      version: '1.0',
      timestamp: Date.now(),
      serviceId,
      methods,
      metadata,
    }

    this.funcMap.set(id, promiser)

    // 发送注册消息
    this.emitEvent('system-register', message)

    return await withTimeout(promiser.promise, 5000)
  }

  /**
   * 请求服务列表
   */
  public async requestServiceList(): Promise<ServiceListResponse['services']> {
    const promiser = withResolvers<ServiceListResponse['services']>()
    const id = nanoid()
    const request: ServiceListRequest = {
      id,
      type: 'system',
      action: 'getServices',
      version: '1.0',
      timestamp: Date.now(),
    }

    this.funcMap.set(id, promiser)

    // 发出请求
    this.socket.emit('system-get-services', request)

    return await withTimeout(promiser.promise, 5000)
  }

  private onSystemServiceListResponse(response: ServiceListResponse) {
    this.logger.info('[MCP Client] Received service list response:', response)

    const resolvers = this.funcMap.get(response.id)
    if (resolvers) {
      resolvers.resolve(response.services)
      this.funcMap.delete(response.id)
    }
    else {
      this.logger.warn(`[MCP Client] No resolver found for service list response with id ${response.id}`)
    }
  }

  private systemRegisteredResponse(response: ServiceRegistrationResponse) {
    this.logger.info('[MCP Client] Received service registration response:', response)

    const resolvers = this.funcMap.get(response.id)
    if (resolvers) {
      resolvers.resolve(response)
      this.funcMap.delete(response.id)
    }
    else {
      this.logger.warn(`[MCP Client] No resolver found for service registration response with id ${response.id}`)
    }
  }
}
