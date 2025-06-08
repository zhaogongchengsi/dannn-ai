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

describe('mcpClient Events 集成测试', () => {
  let server: McpServer
  let client1: McpClient
  let client2: McpClient
  let client3: McpClient

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
    client3 = new McpClient({ url, logger: mockLogger })

    await client1.connect()
    await client2.connect()
    await client3.connect()
  })

  it('应该能正确订阅和接收事件', async () => {
    // 准备
    const eventName = 'test-event'
    const eventData = { message: 'Hello from server' }

    client2.emitEvent(eventName, eventData)

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

  it('应该能正确处理事件的作用域', async () => {
    // 准备
    const eventName = 'room-event'
    const eventData = { message: 'Hello from room' }
    const roomId = 'test-room'

    // 客户端1加入房间
    await client1.joinRoom(roomId)
    await client2.joinRoom(roomId)

    // 设置一个标志来检测客户端3是否收到了事件
    let client3ReceivedEvent = false

    // 客户端3订阅相同的事件
    client3.onEvent(eventName, () => {
      client3ReceivedEvent = true
    })

    // 创建一个 Promise 来等待事件接收
    const eventPromise = new Promise<any>((resolve) => {
      client1.onEvent(eventName, (data) => {
        resolve(data)
      })
    })

    // 客户端2向房间广播事件
    client2.emitEventToRoom(roomId, eventName, eventData)

    // 等待接收事件
    const receivedData = await eventPromise

    // 验证客户端3没有收到事件
    expect(client3ReceivedEvent).toBe(false)
    // 验证
    expect(receivedData).toEqual(eventData)
  })

  it('应该能正确发送事件到特定用户', async () => {
    // 准备
    const eventName = 'user-specific-event'
    const eventData = { message: 'This is for you only' }

    // 每个客户端关联一个唯一的用户ID
    const user1Id = `user-1-${Date.now()}`
    const user2Id = `user-2-${Date.now()}`
    const user3Id = `user-3-${Date.now()}`

    // 客户端关联用户ID
    await client1.authenticate(user1Id)
    await client2.authenticate(user2Id)
    await client3.authenticate(user3Id)

    // 设置标志来跟踪哪些客户端收到了事件
    let client1ReceivedEvent = false
    let client3ReceivedEvent = false

    // 客户端1和客户端3订阅相同的事件
    client1.onEvent(eventName, () => {
      client1ReceivedEvent = true
    })

    client3.onEvent(eventName, () => {
      client3ReceivedEvent = true
    })

    // 创建一个Promise来等待客户端2接收事件
    const eventPromise = new Promise<any>((resolve) => {
      client2.onEvent(eventName, (data) => {
        resolve(data)
      })
    })

    // 客户端1向客户端2的用户ID发送事件
    client1.emitEventToUser(user2Id, eventName, eventData)

    // 等待事件接收或超时
    const receivedData = await eventPromise
    // 验证
    // 1. 客户端2应该收到事件
    expect(receivedData).not.toBeNull()
    expect(receivedData).toEqual(eventData)

    // 2. 客户端1和客户端3不应该收到事件
    expect(client1ReceivedEvent).toBe(false)
    expect(client3ReceivedEvent).toBe(false)

    // 清理 - 断开用户ID关联
    await client1.deauthenticate()
    await client2.deauthenticate()
    await client3.deauthenticate()
  })
})
