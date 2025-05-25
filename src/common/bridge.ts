export type BridgeHandler = (...data: any[]) => any

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

export class Bridge implements IBridge {
  methods: Map<string, BridgeHandler> = new Map()
  waitResponse: Map<string, PromiseWithResolvers<any>> = new Map()
  events: Map<string, Set<BridgeHandler>> = new Map()

  constructor() {}

  /**
   * 
   * @param _ data
   * @returns void
   * @description This method is used to send data to the other side of the bridge. subclass implementation
   */
  send(_: BridgeRequest) {
    throw new Error('send method not implemented')
  }

  private emitEvent(name: string, ...args: any[]) {
    const handlers = this.events.get(name)
    if (handlers) {
      handlers.forEach((handler) => {
        handler(...args)
      })
    }
  }

  onMessage(data: BridgeRequest) {
    console.log('onMessage', data)
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

  on(name: string, handler: (data: BridgeRequestEvent) => void) {
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

  unregister(name: string) {
    this.methods.delete(name)
  }

  invoke<T>(name: string, ...args: any[]) {
    const promiser = Promise.withResolvers<T>()
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
