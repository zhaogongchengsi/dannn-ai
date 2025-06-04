import { withResolvers } from '@zunh/promise-kit'
import { Subject } from 'rxjs/internal/Subject'

export type RpcProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : RpcProxy<T[K]>
}

// 获取 Promise 里的实际类型
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

/**
 * @description 获取 RPC 方法的返回值类型
 * @template TRouter - 路由类型
 */
export type GetRpcReturnType<
  TRouter extends Record<string, any>,
  T extends keyof TRouter,
  M extends keyof TRouter[T] & (string | number | symbol),
> = TRouter[T][M] extends (...args: any) => any
  ? UnwrapPromise<ReturnType<TRouter[T][M]>>
  : never

/**
 * @description 获取 RPC 方法的参数类型
 */
export type OnlyFunctions<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K]
}

/**
 * @description 提取路由器中所有函数的类型
 */
export type ExtractRouterFunctions<T> = {
  [K in keyof T]: {
    [M in keyof T[K]as T[K][M] extends (...args: any[]) => any ? M : never]: T[K][M]
  }
}

export type BridgeHandler = (...data: any[]) => any

export interface BridgeRequestCommon {
  /**
   * @description 转发的 Bridge ID
   */
  _forwardedBy?: string[]
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

export abstract class Bridge extends Subject<BridgeRequest> implements IBridge {
  methods: Map<string, BridgeHandler> = new Map()
  waitResponse: Map<string, PromiseWithResolvers<any>> = new Map()
  events: Map<string, Set<BridgeHandler>> = new Map()
  private _bridgeId = this.randomAlphaString(16)

  onMessagePipe: Set<((data: BridgeRequest) => (BridgeRequest | undefined))> = new Set()

  constructor() {
    super()
    this.register('this.getAllRegistered', () => this.getAllRegistered())
  }

  /**
   * @description 获取当前 Bridge 的唯一 ID
   */
  get bridgeId(): string {
    return this._bridgeId
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

  use(fn: (data: BridgeRequest) => (BridgeRequest | undefined)) {
    if (!fn || typeof fn !== 'function') {
      throw new Error('Pipe function must be a valid function')
    }

    this.onMessagePipe.add(fn)
    return () => {
      this.onMessagePipe.delete(fn)
    }
  }

  onMessage(data: BridgeRequest) {
    // 处理转发的消息 不需要自身处理的
    let _data: BridgeRequest | undefined = data
    this.onMessagePipe.forEach((pipe) => {
      _data = pipe(data)
    })

    // 如果管道处理后返回 undefined，表示不需要继续处理
    if (!_data) {
      return
    }

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

  /**
   * 生成一个动态代理对象，支持 database.ai.findAiByName() 形式调用
   * @param namespace 根命名空间（如 'database'）
   */
  createProxy<T>(namespace: string): RpcProxy<T> {
    // eslint-disable-next-line ts/no-this-alias
    const bridge = this
    const handler = (path: string[] = []) => {
      return new Proxy(() => { }, {
        get(_, prop: string) {
          return handler([...path, prop])
        },
        apply(_, __, args) {
          const method = [namespace, ...path].join('.')
          return bridge.invoke(method, ...args)
        },
      })
    }
    return handler() as unknown as RpcProxy<T>
  }
}
