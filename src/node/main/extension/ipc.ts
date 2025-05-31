import type { BridgeRequest } from '~/common/bridge'
import { isMainThread, parentPort } from 'node:worker_threads'
import { Bridge } from '~/common/bridge'

export class Rpc extends Bridge {
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
