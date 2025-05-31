import type { BridgeRequest } from '~/common/bridge'
import { Bridge } from '~/common/bridge'
import type { DatabaseRouter } from '~/node/database/router'

type RpcProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : RpcProxy<T[K]>
}

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

export class Rpc {
  private static readonly instance = new RendererBridge()
  get rpc(): RendererBridge {
    return Rpc.instance
  }

  /**
   * 生成一个动态代理对象，支持 database.ai.findAiByName() 形式调用
   * @param namespace 根命名空间（如 'database'）
   */
  createProxy<T>(namespace: string): RpcProxy<T> {
    const bridge = this.rpc
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



