import type { Logger } from '../shared/logger'
import type { ServerConfig } from './core/config'
import { ConnectionServer } from './core/connection'
import { Discovery } from './core/discovery'
import { EventManager } from './core/event'

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

  constructor(config: ServerConfig) {
    this.config = config
    this.logger = config.logger ?? console

    this.connection = new ConnectionServer(this.config)
    this.event = new EventManager(this.connection, this.logger)
    this.discovery = new Discovery(this.connection, this.logger)
  }

  public async start(): Promise<void> {
    return await this.connection.start()
  }

  public async stop(): Promise<void> {
    return await this.connection.stop()
  }
}

export function createServer(config: ServerConfig): Server {
  return new McpServer(config)
}
