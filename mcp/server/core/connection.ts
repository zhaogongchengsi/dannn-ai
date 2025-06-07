import type { Server as HTTPServer } from 'node:http'
import type { Logger } from '../../shared/logger'
import type { ServerConfig } from './config'
import { createServer } from 'node:http'
import { Server as IOServer } from 'socket.io'

export class ConnectionServer {
  private isStarted: boolean = false
  private httpServer: HTTPServer
  private io: IOServer
  private config: ServerConfig
  private logger: Logger
  constructor(config: ServerConfig) {
    this.config = config
    this.logger = config.logger ?? console
    this.httpServer = createServer()
    this.io = new IOServer(this.httpServer, {
      cors: {
        origin: '*',
      },
    })
  }

  getSocketServer(): IOServer {
    return this.io
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
