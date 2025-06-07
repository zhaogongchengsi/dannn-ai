import type { Socket } from 'socket.io-client'
import type { Logger } from '../../shared/logger'
import { io } from 'socket.io-client'

export interface ConnectionConfig {
  url: string
  logger?: Logger
}

export class Connection {
  private socket: Socket
  private logger: Logger
  private connected: boolean = false

  constructor(private config: ConnectionConfig) {
    this.logger = config.logger ?? console
    this.socket = io(config.url, {
      autoConnect: false,
      transports: ['websocket'],
    })
    this.setupDefaultHandlers()
  }

  private setupDefaultHandlers() {
    this.socket.on('connect', () => {
      this.connected = true
      this.logger.info(`[MCP Connection] Connected to ${this.config.url}`)
    })

    this.socket.on('disconnect', () => {
      this.connected = false
      this.logger.info('[MCP Connection] Disconnected')
    })

    this.socket.on('connect_error', (err) => {
      this.logger.error('[MCP Connection] Connection error:', err)
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

  public isConnected(): boolean {
    return this.connected
  }

  public getSocket(): Socket {
    return this.socket
  }

  public getLogger(): Logger {
    return this.logger
  }
}
