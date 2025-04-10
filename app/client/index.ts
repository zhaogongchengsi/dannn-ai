import type { TRPCClient } from '@trpc/client'
import type { Socket } from 'socket.io-client'
import type { AppRouter } from '../main/server/router'
import process from 'node:process'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { io } from 'socket.io-client'

const host = `127.0.0.1`

export function createClient(): {
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
