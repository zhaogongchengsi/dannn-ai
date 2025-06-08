import type { BridgeRequest } from '~/common/bridge'
import type { ExtensionDatabaseRouter } from '~/node/database/router'
import process from 'node:process'
import { isMainThread, parentPort } from 'node:worker_threads'
import { createClient } from 'mcp/client/client'
import { Bridge } from '~/common/bridge'

class Rpc extends Bridge {
  constructor() {
    super()
    if (!isMainThread && parentPort) {
      parentPort.on('message', (data: BridgeRequest) => {
        this.onMessage(data)
      })
    }
  }

  send(data: BridgeRequest): void {
    if (!isMainThread && parentPort) {
      parentPort.postMessage(data)
    }
  }
}

export const client = createClient({
  url: `ws://127.0.0.1:${process.env.DANNN_EXTENSION_SERVER_PORT}`,
  logger: console,
})

export const rpc = new Rpc()
export const database = rpc.createProxy<ExtensionDatabaseRouter>('database')
