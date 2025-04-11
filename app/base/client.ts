import type { TRPCClient } from '@trpc/client'
import type { Socket } from 'socket.io-client'
import type { AppRouter } from '../main/server/router'
import process from 'node:process'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { io } from 'socket.io-client'

const host = '127.0.0.1'

/**
 * 基础客户端单例类，负责管理trpc和socket连接
 */
export class BaseClient {
  private static instance: BaseClient | null = null
  private _trpc: TRPCClient<AppRouter>
  private _socket: Socket

  private constructor() {
    const { trpc, socket } = createClient()
    this._trpc = trpc
    this._socket = socket
  }

  public static getInstance(): BaseClient {
    if (!BaseClient.instance) {
      BaseClient.instance = new BaseClient()
    }
    return BaseClient.instance
  }

  get trpc(): TRPCClient<AppRouter> {
    return this._trpc
  }

  get socket(): Socket {
    return this._socket
  }
}

function createClient(): {
  trpc: TRPCClient<AppRouter>
  socket: Socket
} {
  if (
    typeof process === 'undefined'
    || typeof process.env === 'undefined'
    || typeof process.env.PORT === 'undefined'
  ) {
    throw new TypeError('PORT is not defined')
  }

  const port = process.env.PORT

  const url = `http://${host}:${port}/`
  const ws = `ws://${host}:${port}/`

  const trpc = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
      }),
    ],
  })

  const socket: Socket = io(ws, {
    reconnectionDelayMax: 10000,
  })

  return {
    trpc,
    socket,
  }
}
