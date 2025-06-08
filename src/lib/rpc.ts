import { createClient } from 'mcp/client/client'
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

export const client = createClient({
  url: `ws://127.0.0.1:${process.env.MCP_PORT}`,
  logger: console,
})

export const rendererBridge = new RendererBridge()