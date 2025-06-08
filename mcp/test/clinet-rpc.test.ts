import { getRandomPort } from 'get-port-please'
import { McpServer } from 'mcp/server/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { McpClient } from '../client/client'

// 模拟 logger，避免控制台输出影响测试
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

describe('mcpClient RPC 集成测试', () => {
  let server: McpServer
  let client1: McpClient
  let client2: McpClient

  beforeAll(async () => {
    const port = await getRandomPort()
    server = new McpServer({
      host: '127.0.0.1',
      port,
      logger: mockLogger,
    })
    await server.start()

    const url = `ws://127.0.0.1:${port}`

    client1 = new McpClient({ url, logger: mockLogger })
    client2 = new McpClient({ url, logger: mockLogger })

    await client1.connect()
    await client2.connect()
  })

  it('应该能正确注册 RPC 方法', async () => {
    // client1 注册一个 RPC 方法
    const result = await client1.registerRpcMethod('mathService', 'add', () => {})

    // 验证结果
    expect(result).toBe(true)
  })
})
