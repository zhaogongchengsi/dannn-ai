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

export const rendererBridge = new RendererBridge()
