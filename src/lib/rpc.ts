import type { BridgeRequest } from '~/common/bridge'
import { createClient } from 'mcp/client/client'
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
  // eslint-disable-next-line node/prefer-global/process
  url: `ws://127.0.0.1:${window.process.env.MCP_PORT}`,
  logger: console,
})

export const rendererBridge = new RendererBridge()
