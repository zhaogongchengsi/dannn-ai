import type { ServerConfig } from '../server/core/config'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { McpServer } from '../server/server'

describe('mcpServer', () => {
  let server: McpServer
  const config: ServerConfig = {
    host: '127.0.0.1',
    port: 4000,
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  }

  beforeEach(() => {
    Object.values(config.logger ?? {}).forEach((fn: any) => {
      if (fn && fn.mockClear)
        fn.mockClear()
    })
    server = new McpServer(config)
  })

  afterEach(async () => {
    await server.stop()
  })

  it('should start the server', async () => {
    await server.start()
    expect(config.logger?.info).toHaveBeenCalledWith('[MCP Server] Listening on 127.0.0.1:4000')
  })

  it('should stop the server', async () => {
    await server.start()
    await server.stop()
    expect(config.logger?.info).toHaveBeenCalledWith('[MCP Server] Stopped')
  })

  it('should ignore stop if not started', async () => {
    await server.stop()
    // 不报错即可
  })
})
