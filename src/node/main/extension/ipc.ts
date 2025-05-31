import type { BridgeRequest } from '~/common/bridge'
import type { ExtensionDatabaseRouter } from '~/node/database/router'
import { isMainThread, parentPort } from 'node:worker_threads'
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

export const rpc = new Rpc()
export const database = rpc.createProxy<ExtensionDatabaseRouter>('database')

class RendererBridge extends Bridge {
  constructor() {
    super()
    rpc.on('forward:window:message', (data: BridgeRequest) => {
      this.onMessage(data)
    })
  }

  send(data: BridgeRequest): void {
    rpc.emit('forward:extension:message', data)
  }
}

export const windowBridge = new RendererBridge()
