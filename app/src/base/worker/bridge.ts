import type { WorkerCallFunctionErrorMessage, WorkerCallFunctionMessage, WorkerCallFunctionResponseMessage, WorkerEventEmitMessage, WorkerMessage } from '@dannn/schemas'
import type { ExtensionEvent } from '../types/extension'
import { Event } from '../common/event'

export class WorkerBridge extends Event<ExtensionEvent> {
  private worker: Worker | null = null
  isReady: PromiseWithResolvers<void> | null = Promise.withResolvers<void>()
  name: string
  url: string
  promiserMap: Map<string, PromiseWithResolvers<any>> = new Map()
  readyMethodsName: Set<string> = new Set()
  handlers: Map<string, (arg1: any, ...args: any[]) => void> = new Map()
  workerEvent: Event<Record<string, any>> = new Event()
  waitResolved: Set<WorkerCallFunctionMessage> = new Set()

  constructor(name: string, url: string) {
    super()
    this.name = name
    this.url = url
    this.worker = new Worker(`dannn://import.extension/${url}?name=${name}`, {
      type: 'module',
    })

    this.worker.onmessage = (e) => {
      const message = e.data as WorkerMessage
      this.onMessage(message)
    }

    this.worker.onerror = (e) => {
      console.error(`Worker ${this.name} error:`, e.message)
    }

    this.worker.onmessageerror = (e: any) => {
      console.error(`Worker ${this.name} message error:`, e?.message)
    }

    this.expose('done', () => {
      this.handleDone()
    })
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }

  private handleDone() {
    this.isReady?.resolve()
    this.isReady = null
  }

  private handleCallResult(message: WorkerCallFunctionResponseMessage) {
    const promiser = this.promiserMap.get(message.id)
    if (promiser) {
      promiser.resolve(message.data.result)
    }
  }

  private handleError(message: WorkerCallFunctionErrorMessage) {
    const promiser = this.promiserMap.get(message.id)
    if (promiser) {
      promiser.reject(new Error(message.data.error))
    }
  }

  private handleCall(message: WorkerCallFunctionMessage) {
    const { id, data } = message
    const handler = this.handlers.get(data.name.trim())
    if (handler) {
      const args = data.args || []
      Promise.resolve(handler.apply(this, [args[0], ...args.slice(1)]))
        .then((result) => {
          this.postMessage({
            type: 'call-function-response',
            id,
            data: {
              result,
            },
          })
        })
        .catch((error) => {
          this.postMessage({
            type: 'call-function-error',
            id,
            data: {
              error: error.message,
            },
          })
        })
        .finally(() => {
          this.waitResolved.delete(message)
        })
    }
    else {
      this.waitResolved.add(message)
    }
  }

  waitReady() {
    if (this.isReady) {
      return this.isReady.promise
    }
    return Promise.resolve()
  }

  private onMessage(message: WorkerMessage) {
    switch (message.type) {
      case 'call-function-response':
        this.handleCallResult(message)
        break
      case 'call-function-error':
        this.handleError(message)
        break
      case 'call-function':
        this.handleCall(message)
        break
      case 'event-emit':
        this.handleEvent(message)
        break
    }
  }

  private handleEvent(message: WorkerEventEmitMessage) {
    const { name, event } = message.data
    this.workerEvent.emit(name, event)
  }

  emitWorkerEvent(name: string, event: Record<string, any>) {
    this.postMessage({
      type: 'event-emit',
      data: {
        name,
        event,
      },
    })
  }

  onWorkerEvent(name: string, fn: (e: any) => void) {
    this.workerEvent.on(name, fn)
  }

  invoke<T>(name: string, ...args: any[]) {
    const id = this.generateId()
    if (this.isReady) {
      return Promise.reject(new Error('Worker not ready'))
    }

    const promiser = Promise.withResolvers<T>()

    this.promiserMap.set(id, promiser)

    this.postMessage({
      type: 'call-function',
      data: {
        name,
        args,
      },
      id,
    })

    promiser.promise.finally(() => {
      this.promiserMap.delete(id)
    })

    return promiser.promise
  }

  expose(name: string, handler: (arg1: any, ...args: any[]) => void) {
    this.handlers.set(name, handler)
    this.waitResolved.forEach((message) => {
      this.handleCall(message)
    })
  }

  private generateId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36)}`
  }

  get isWorkerReady() {
    return this.isReady
  }

  get isWorkerLoaded() {
    return this.worker !== null
  }

  postMessage(message: WorkerMessage) {
    if (this.worker) {
      this.worker.postMessage(message)
    }
  }
}
