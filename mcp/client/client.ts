import type { Socket } from 'socket.io-client'
import type { Logger } from '../shared/logger' // 你自己定义的 Logger 接口
import { io } from 'socket.io-client'

export interface ClientConfig {
  url: string
  logger?: Logger
}

export class McpClient {
  private socket: Socket
  private logger: Logger
  private connected: boolean = false

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
}
