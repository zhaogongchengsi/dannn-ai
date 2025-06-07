import type { Socket } from 'socket.io-client'
import type { Logger } from '../../shared/logger'
import type { Connection } from './connection'
import { withResolvers, withTimeout } from '@zunh/promise-kit'

export class MessageHandler {
  private pendingRequests: Map<string, PromiseWithResolvers<any>> = new Map()
  private logger: Logger
  _connection: Connection
  socket: Socket

  constructor(connection: Connection, logger: Logger) {
    this._connection = connection
    this.socket = connection.getSocket()
    this.logger = logger
  }

  public registerResponseHandler(eventName: string, idExtractor: (response: any) => string) {
    this.socket.on(eventName, (response: any) => {
      const id = idExtractor(response)
      const resolver = this.pendingRequests.get(id)

      if (resolver) {
        resolver.resolve(response)
        this.pendingRequests.delete(id)
      }
      else {
        this.logger.warn(`[MCP MessageHandler] No resolver found for response with id ${id}`)
      }
    })
  }

  public async sendRequest<T>(
    eventName: string,
    payload: any,
    timeoutMs: number = 5000,
  ): Promise<T> {
    const id = payload.id
    const promiser = withResolvers<T>()

    this.pendingRequests.set(id, promiser)
    this.socket.emit(eventName, payload)

    try {
      return await withTimeout(promiser.promise, timeoutMs)
    }
    catch (error) {
      this.pendingRequests.delete(id)
      throw error
    }
  }
}
