import {
  getRandomPort,
} from 'get-port-please'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { McpClient } from '../client/client'
import { McpServer } from '../server/server'

// 模拟 logger，避免控制台输出影响测试
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

describe('mCP 客户端与服务端联测', () => {
  let server: McpServer
  let client1: McpClient
  let client2: McpClient

  // 每个测试前启动服务端并连接两个客户端
  beforeEach(async () => {
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

  it('两个客户端成功连接服务端', async () => {
    expect(client1.isConnected()).toBe(true)
    expect(client2.isConnected()).toBe(true)
  })

  it('客户端注册服务，服务端能正确返回服务列表', async () => {
    // client1 注册一个服务
    await client1.registerService('mathService', ['add', 'subtract'], { version: '1.0' })

    // client2 请求服务列表
    const services = await client2.requestServiceList()
    // 断言服务发现成功
    expect(services).toContainEqual({
      serviceId: 'mathService',
      methods: ['add', 'subtract'],
      metadata: { version: '1.0' },
    })
  })

  it('客户端断开连接后，服务自动从列表中移除', async () => {
    // 注册服务
    client1.emitEvent('registerService', {
      serviceId: 'tempService',
      methods: ['ping'],
    })

    // 断开 client1
    await client1.disconnect()

    // 等待服务端处理断开
    await new Promise(resolve => setTimeout(resolve, 100))

    // 通过 client2 获取服务列表
    const services = await client2.requestServiceList()

    // 应该没有 tempService
    expect(services.find(s => s.serviceId === 'tempService')).toBeUndefined()
  })
})
