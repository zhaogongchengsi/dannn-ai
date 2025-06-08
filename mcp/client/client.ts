import type { Logger } from '../shared/logger' // 你自己定义的 Logger 接口
import type {
  ServiceListResponse,
} from '../shared/protocols/discovery'
import { Connection } from './core/connection'
import { Discovery } from './core/discovery'
import { Events } from './core/event'
import { MessageHandler } from './core/message-handler'
import { Rpc } from './core/rpc'

export interface ClientConfig {
  url: string
  logger?: Logger
}

export class McpClient {
  private _connection: Connection
  private _message: MessageHandler
  private _discovery: Discovery
  private _events: Events
  private _rpc: Rpc

  constructor(config: ClientConfig) {
    const logger = config.logger ?? console

    this._connection = new Connection(config)
    this._message = new MessageHandler(this._connection, logger)
    this._events = new Events(this._connection, this._message, logger)
    // 初始化功能模块
    this._discovery = new Discovery(
      this._connection,
      this._message,
      logger,
    )

    this._rpc = new Rpc(this._connection, this._message, logger)
  }

  // 暴露功能模块的访问器
  public get discovery(): Discovery {
    return this._discovery
  }

  public get events(): Events {
    return this._events
  }

  public get rpc(): Rpc {
    return this._rpc
  }

  public async connect(): Promise<void> {
    return this._connection.connect()
  }

  public async disconnect(): Promise<void> {
    return this._connection.disconnect()
  }

  public isConnected() {
    return this._connection.isConnected()
  }

  /**
   * 注册一个服务
   */
  public async registerService(serviceId: string, methods: string[], metadata?: Record<string, any>) {
    return this._discovery.registerService(serviceId, methods, metadata)
  }

  /**
   * 请求服务列表
   */
  public async requestServiceList(): Promise<ServiceListResponse['services']> {
    return await this._discovery.getServiceList()
  }

  // 事件便捷方法
  public onEvent<T = any>(event: string, handler: (data: T) => void) {
    this._events.subscribe(event, handler)
  }

  public offEvent(event: string, handler?: (...args: any[]) => void) {
    this._events.unsubscribe(event, handler)
  }

  public emitEvent(event: string, data: any) {
    this._events.emit(event, data)
  }

  public async joinRoom(roomId: string) {
    return await this._events.joinRoom(roomId)
  }

  public async leaveRoom(roomId: string) {
    return await this._events.leaveRoom(roomId)
  }

  public emitEventToRoom(roomId: string, event: string, data: any) {
    return this._events.emitToRoom(roomId, event, data)
  }

  public emitEventToUser(userId: string, event: string, data: any) {
    return this._events.emitToUser(userId, event, data)
  }

  public async authenticate(token: string): Promise<boolean> {
    return this.events.authenticate(token)
  }

  public async deauthenticate(): Promise<void> {
    return this._events.deauthenticate()
  }

  public offAllEvents() {
    return this._events.unsubscribeAll()
  }

  /**
   *
   * @param provideId 服务提供者ID
   * @param method 方法名
   * @param handler 处理函数
   * @returns boolean
   */
  public async registerRpcMethod(method: string, handler: (...args: any[]) => any) {
    return await this._rpc.register(method, handler)
  }

  public async callRpcMethod(method: string, ...args: any[]) {
    return await this._rpc.call(method, args)
  }
}
