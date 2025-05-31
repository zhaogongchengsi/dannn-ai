import type { BridgeRequest } from '~/common/bridge'
import { Bridge } from '~/common/bridge'

class RendererBridge extends Bridge {
  constructor() {
    super()
    window.dannn.ipc.on('trpc:message', (_, data: BridgeRequest) => {
      this.onMessage(data)
    })
  }

  send(data: BridgeRequest): void {
    window.dannn.ipc.send('trpc:message', data)
  }
}

export class Rpc {
  private static readonly instance = new RendererBridge()
  get rpc(): RendererBridge {
    return Rpc.instance
  }
}

class ExtensionBridge extends Bridge {
  rpc: RendererBridge
  constructor() {
    super()
    this.rpc = new Rpc().rpc
    this.rpc.on('forward:extension:message', (data: BridgeRequest) => {
      this.onMessage(data)
    })
  }

  send(data: BridgeRequest): void {
    this.rpc.emit('forward:window:message', data)
  }
}

export const extensionBridge = new ExtensionBridge()
