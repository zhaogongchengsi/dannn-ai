import { withResolvers } from '@zunh/promise-kit'

export type BridgeHandler = (...data: any[]) => any

export interface BridgeRequestCommon {
  /**
   * @description 转发的 Bridge ID
   */
  forwardedBy: string[]

  /**
   * @description 是否是转发的消息
   */
  isForwarded?: boolean

  /**
   * @description 是否需要本体事件响应
   */
  forwardedNeedSelfEvent?: boolean
}

export interface BridgeRequestEvent {
  type: 'event'
  name: string
  preload: any[]
}

export interface BridgeRequestInvoke {
  type: 'invoke'
  id: string
  name: string
  args: any[]
}

export interface BridgeRequestResponse {
  type: 'response'
  id: string
  name: string
  result: any | null
  error: string | null
}

export type BridgeRequest = BridgeRequestEvent | BridgeRequestInvoke | BridgeRequestResponse

export interface IBridge {
  send: (data: BridgeRequest) => void
  onMessage: (data: BridgeRequest) => void
}

export abstract class Bridge implements IBridge {
  methods: Map<string, BridgeHandler> = new Map()
  waitResponse: Map<string, PromiseWithResolvers<any>> = new Map()
  events: Map<string, Set<BridgeHandler>> = new Map()
  private _bridgeId = this.randomAlphaString(16)

  constructor() {
    this.register('this.getAllRegistered', () => this.getAllRegistered())
  }

  /**
   * @description 获取当前 Bridge 的唯一 ID
   */
  get bridgeId(): string {
    return this._bridgeId
  }

  /**
   * 将本 Bridge 收到的所有消息转发到目标 Bridge 实例
   * @param target 目标 Bridge 实例
   * @param filter 可选过滤函数，返回 true 时才转发
   * @returns 停止转发的函数
   */
  forwardTo(target: Bridge, filter?: (data: BridgeRequest) => boolean): () => void {
    const id = this._bridgeId
    const handler = (data: BridgeRequest & { __forwardedBy?: string[] }) => {
      // 检查是否已被本 Bridge 转发过，避免循环
      if (Array.isArray(data.__forwardedBy) && data.__forwardedBy.includes(id)) {
        return
      }
      if (!filter || filter(data)) {
        // 标记已转发
        const forwardedBy = Array.isArray(data.__forwardedBy) ? [...data.__forwardedBy, id] : [id]
        // 构造新对象，避免污染原消息
        const newData = { ...data, __forwardedBy: forwardedBy }
        target.onMessage(newData as BridgeRequest)
      }
    }
    // 包装 onMessage，转发后再执行原逻辑
    const originalOnMessage = this.onMessage.bind(this)
    this.onMessage = (data: BridgeRequest) => {
      handler(data as any)
      originalOnMessage(data)
    }
    // 返回取消转发的方法
    return () => {
      this.onMessage = originalOnMessage
    }
  }

  /**
   *
   * @param _ data
   * @description This method is used to send data to the other side of the bridge. subclass implementation
   */
  abstract send(_: BridgeRequest): void

  private emitEvent(name: string, ...args: any[]) {
    const handlers = this.events.get(name)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args)
        }
        catch (e) {
          console.error(`Error in event handler for ${name}:`, e)
        }
      })
    }
  }

  onMessage(data: BridgeRequest) {
    if (data.type === 'event') {
      this.emitEvent(data.name, ...data.preload)
      return
    }

    if (data.type === 'invoke') {
      const { id, name, args } = data
      const handler = this.methods.get(name)
      if (!handler) {
        this.send({
          type: 'response',
          name,
          id,
          result: null,
          error: `Method ${name} not found`,
        })
        return
      }
      Promise.resolve(handler(...args)).then((result) => {
        this.send({
          type: 'response',
          name,
          id,
          result,
          error: null,
        })
      }).catch((e) => {
        console.error(e)
        this.send({
          type: 'response',
          name,
          id,
          result: null,
          error: e.message || 'Unknown error',
        })
      })
      return
    }

    if (data.type === 'response') {
      const { id, result, error } = data
      const promiser = this.waitResponse.get(id)
      if (!promiser) {
        console.warn(`Response for ${id} not found`)
        return
      }
      if (error) {
        promiser.reject(new Error(error))
      }
      else {
        promiser.resolve(result)
      }
      this.waitResponse.delete(id)
    }
  }

  on(name: string, handler: (data: any) => void) {
    if (!this.events.has(name)) {
      this.events.set(name, new Set())
    }
    const handlers = this.events.get(name)
    if (handlers) {
      handlers.add(handler)
    }
  }

  emit(name: string, ...args: any[]) {
    this.send({
      type: 'event',
      name,
      preload: args,
    })
  }

  register(name: string, handler: BridgeHandler) {
    if (this.methods.has(name)) {
      throw new Error(`Method ${name} already registered`)
    }
    this.methods.set(name, handler)
  }

  isRegistered(name: string): boolean {
    return this.methods.has(name)
  }

  getAllRegistered(): string[] {
    return Array.from(this.methods.keys())
  }

  async getAllInvokeMethods(): Promise<string[]> {
    return await this.invoke<string[]>('this.getAllRegistered')
  }

  unregister(name: string) {
    this.methods.delete(name)
  }

  async invoke<T>(name: string, ...args: any[]) {
    const promiser = withResolvers<T>()
    const id = this.randomAlphaString(16)
    this.waitResponse.set(id, promiser)
    promiser.promise.finally(() => {
      this.waitResponse.delete(id)
    })

    this.send({
      type: 'invoke',
      id,
      name,
      args,
    })

    return await promiser.promise
  }

  randomAlphaString(length: number): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    let result = ''

    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * alphabet.length)
      result += alphabet[index]
    }

    return result
  }
}
