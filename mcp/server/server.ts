import type { Server as HTTPServer } from 'node:http'
import type { Server as IOServer } from 'socket.io'
import type { Logger } from '../shared/logger'
import type { ServerConfig } from './core/config'
import { ConnectionServer } from './core/connection'
import { Discovery } from './core/discovery'
import { EventManager } from './core/event'
import { RpcManager } from './core/rpc'

export interface Server {
  start: () => Promise<void>
  stop: () => Promise<void>
}

export class McpServer implements Server {
  private config: ServerConfig
  private logger: Logger

  private connection: ConnectionServer
  private event: EventManager
  private discovery: Discovery
  private rpc: RpcManager // 这里可以替换为实际的 RPC 管理器类型

  constructor(config: ServerConfig) {
    this.config = config
    this.logger = config.logger ?? console

    this.connection = new ConnectionServer(this.config)
    this.event = new EventManager(this.connection, this.logger)
    this.discovery = new Discovery(this.connection, this.logger)
    this.rpc = new RpcManager(this.connection, this.logger)
  }

  public async start(): Promise<void> {
    return await this.connection.start()
  }

  public async stop(): Promise<void> {
    return await this.connection.stop()
  }

  // McpServer 类中添加的测试辅助方法
  public isRunning(): boolean {
    return this.connection.getRunning() // 假设内部有_running标志
  }

  public getHttpServer(): HTTPServer | null {
    return this.connection.getHttpServer()
  }

  public getSocketServer(): IOServer | null {
    return this.connection.getSocketServer()
  }
}

export function createServer(config: ServerConfig): Server {
  return new McpServer(config)
}
