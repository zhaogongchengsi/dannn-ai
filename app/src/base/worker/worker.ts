import type { DnWorkerEvents, WorkerMessage } from '../types/worker'
import { DnEvent } from '../common/event'

export class DnWorker extends DnEvent<DnWorkerEvents> {
  private worker: Worker | null = null
  private isReady = false
  name: string
  url: string
  promiserMap: Map<string, PromiseWithResolvers<any>> = new Map()
  readyMethodsName: Set<string> = new Set()

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

  private onMessage(message: any) {
    if (!('type' in message.data)) {
      return
    }
    message = message as WorkerMessage
    switch (message.data.type) {
      case 'done':
        this.isReady = true
        this.emit('loaded', this.name)
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

  generateId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36)}`
  }

  get isWorkerReady() {
    return this.isReady
  }

  postMessage(message: any) {
    if (this.worker) {
      this.worker.postMessage(message)
    }
  }
}
