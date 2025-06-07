import { getRandomPort } from 'get-port-please'
import { McpServer } from 'mcp/server/server'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { McpClient } from '../client/client'

// 模拟 logger，避免控制台输出影响测试
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

describe.todo('mcpClient Events 集成测试', () => {
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

  // 每个测试后关闭连接和服务
  afterEach(async () => {
    await client1.disconnect()
    await client2.disconnect()
    await server.stop()
  })

  it('应该能正确订阅和接收事件', async () => {
    // 准备
    const eventName = 'test-event'
    const eventData = { message: 'Hello from server' }

    // 创建一个 Promise 来等待事件接收
    const eventPromise = new Promise<any>((resolve) => {
      client1.onEvent(eventName, (data) => {
        resolve(data)
      })
    })

    // 等待接收事件
    const receivedData = await eventPromise

    // 验证
    expect(receivedData).toEqual(eventData)
  })
})
