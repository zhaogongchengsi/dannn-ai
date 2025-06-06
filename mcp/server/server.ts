import type { Server as HTTPServer } from 'node:http'
import { createServer as createHTTPServer } from 'node:http'
import { Server as IOServer } from 'socket.io'

export interface Logger {
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  debug?: (...args: any[]) => void
}

export interface ServerConfig {
  port: number
  host: string
  logger?: Logger
}

export interface Server {
  start: () => Promise<void>
  stop: () => Promise<void>
}

export class McpServer implements Server {
  private config: ServerConfig
  private httpServer: HTTPServer
  private io: IOServer
  private isStarted: boolean = false
  private logger: Logger

  constructor(config: ServerConfig) {
    this.config = config
    this.logger = config.logger ?? console
    this.httpServer = createHTTPServer()
    this.io = new IOServer(this.httpServer, {
      cors: {
        origin: '*',
      },
    })
  }

  public async start(): Promise<void> {
    if (this.isStarted)
      return
    await new Promise<void>((resolve) => {
      this.httpServer.listen(this.config.port, this.config.host, () => {
        this.logger.info(`[MCP Server] Listening on ${this.config.host}:${this.config.port}`)
        resolve()
      })
    })
    this.isStarted = true
  }

  public async stop(): Promise<void> {
    if (!this.isStarted)
      return
    await new Promise<void>((resolve, reject) => {
      this.httpServer.close(err => (err ? reject(err) : resolve()))
    })
    this.io.close()
    this.isStarted = false
    this.logger.info(`[MCP Server] Stopped`)
  }
}

export function createServer(config: ServerConfig): Server {
  return new McpServer(config)
}
