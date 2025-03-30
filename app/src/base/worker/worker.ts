/* eslint-disable no-case-declarations */
import type { DnWorkerEvents, WorkerMessage } from '../types/worker'
import { DnEvent } from '../common/event'

export class DnWorker extends DnEvent<DnWorkerEvents> {
  private worker: Worker | null = null
  private isReady = false
  name: string
  url: string
  promiserMap: Map<string, PromiseWithResolvers<any>> = new Map()
  readyMethodsName: Set<string> = new Set()
  donePromiser: PromiseWithResolvers<void> | null = null
  handlers: Map<string, (arg1: any, ...args: any[]) => void> = new Map()

  constructor(name: string, url: string) {
    super()
    this.name = name
    this.url = url
    this.worker = new Worker(`dannn://loader.extension/${url}?name=${name}`, {
      type: 'module',
    })
    this.worker.onmessage = (e) => {
      this.emit('worker:message', e.data)
      this.onMessage(e)
    }

    this.worker.onerror = (e) => {
      this.emit('worker:error', e)
    }

    this.worker.onmessageerror = (e) => {
      this.emit('worker:messageerror', e)
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
      this.emit('unloaded', undefined)
    }
  }

  private onMessage(message: any) {
    if (!('type' in message.data)) {
      return
    }
    message = message as WorkerMessage
    switch (message.data.type) {
      case 'done':
        this.isReady = true
        this.emit('loaded', this.name)
        if (this.donePromiser) {
          this.donePromiser.resolve()
          this.donePromiser = null
        }
        break
      case 'call-result':
        const promiser = this.promiserMap.get(message.data.id)
        if (promiser) {
          promiser.resolve(message.data.result)
        }
        break
      case 'call-error':
        const promiserError = this.promiserMap.get(message.data.id)
        if (promiserError) {
          promiserError.reject(new Error(message.data.error))
        }
        break
      case 'module':
        this.readyMethodsName.add(message.data.name)
        break
      case 'call':
        const { id, args, name } = message.data
        const handler = this.handlers.get(name)
        if (handler) {
          Promise.resolve(handler.apply(this, args))
            .then((result) => {
              this.postMessage({
                type: 'call-result-from-window',
                id,
                result,
              })
            })
            .catch((error) => {
              this.postMessage({
                type: 'call-result-from-window',
                id,
                error: error.message,
              })
            })
        }
    }
  }

  invoke<T>(name: string, ...args: any[]) {
    if (!this.readyMethodsName.has(name)) {
      return Promise.reject(new Error(`Method ${name} not ready`))
    }

    const id = this.generateId()
    if (!this.isReady) {
      return Promise.reject(new Error('Worker not ready'))
    }

    const promiser = Promise.withResolvers<T>()

    this.promiserMap.set(id, promiser)

    this.postMessage({
      type: 'call',
      name,
      args,
      id,
    })

    promiser.promise.finally(() => {
      this.promiserMap.delete(id)
    })

    return promiser.promise
  }

  expose(name: string, handler: (arg1: any, ...args: any[]) => void) {
    if (this.isWorkerLoaded) {
      this.postMessage({
        type: 'expose',
        name,
      })
    }
    this.handlers.set(name, handler)
  }

  generateId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36)}`
  }

  get isWorkerReady() {
    return this.isReady
  }

  get isWorkerLoaded() {
    return this.worker !== null
  }

  postMessage(message: any) {
    if (this.worker) {
      this.worker.postMessage(message)
    }
  }

  async activate() {
    if (!this.isReady) {
      this.donePromiser = Promise.withResolvers<void>()
      return await this.donePromiser.promise
    } else {
      return this.invoke<void>('activate')
    }
  }
}
