import { Subject } from 'rxjs'

export type BridgeHandler = (...data: any[]) => any

export interface BridgeRequestEvent {
  type: 'event'
  name: string
  args: any[]
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

export class Bridge extends Subject<BridgeRequest> implements IBridge {
  methods: Map<string, BridgeHandler> = new Map()
  waitResponse: Map<string, PromiseWithResolvers<any>> = new Map()

  constructor() {
    super()
  }

  /**
   * 
   * @param _ data
   * @returns void
   * @description This method is used to send data to the other side of the bridge. subclass implementation
   */
  send(_: BridgeRequest) {
    throw new Error('send method not implemented')
  }

  onMessage(data: BridgeRequest) {
    if (data.type === 'event') {
      this.next(data)
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
    }

    if (data.type === 'response') {
      const { id, result, error } = data
      const promiser = this.waitResponse.get(id)
      if (!promiser) {
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

  on(handler: (data: BridgeRequest) => void) {
    const subscription = this.subscribe(handler)
    return () => subscription.unsubscribe()
  }

  emit(name: string, ...args: any[]) {
    this.send({
      type: 'event',
      name,
      args,
    })
  }

  register(name: string, handler: BridgeHandler) {
    if (this.methods.has(name)) {
      throw new Error(`Method ${name} already registered`)
    }
    this.methods.set(name, handler)
  }

  unregister(name: string) {
    this.methods.delete(name)
  }

  invoke(name: string, ...args: any[]) {
    const promiser = Promise.withResolvers()
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

    return promiser.promise
  }

  private randomAlphaString(length: number): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    let result = ''

    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * alphabet.length)
      result += alphabet[index]
    }

    return result
  }
}
