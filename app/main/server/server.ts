import type { Server as HttpServer, IncomingMessage, ServerResponse } from 'node:http'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { Server } from 'socket.io'
import { createContext } from './context'
import { appRouter } from './router'

export function createServer(port: number) {
  let server: HttpServer<typeof IncomingMessage, typeof ServerResponse> | undefined
  let io: Server | undefined
  function init() {
    server = createHTTPServer({
      router: appRouter,
      createContext,
    })
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })
  }

  function start() {
    if (!server) {
      init()
    }
    return new Promise<void>((resolve) => {
      server?.listen(port, '127.0.0.1', () => {
        resolve()
      })
    })
  }

  function stop() {
    server?.close()
    io?.close()
    server = undefined
    io = undefined
  }

  async function restart() {
    stop()
    await start()
  }

  return {
    server,
    io,
    start,
    stop,
    restart,
  }
}
