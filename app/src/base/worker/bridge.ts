import type { WorkerCallErrorMessage, WorkerCallMessage, WorkerCallResultMessage, WorkerMessage, WorkerModuleMessage } from '../types/worker'
import { filter, Subject } from 'rxjs'

export class WorkerBridge {
  private worker: Worker | null = null
  isReady = false
  name: string
  url: string
  promiserMap: Map<string, PromiseWithResolvers<any>> = new Map()
  readyMethodsName: Set<string> = new Set()
  donePromiser: PromiseWithResolvers<void> | null = null
  handlers: Map<string, (arg1: any, ...args: any[]) => void> = new Map()
  subject: Subject<WorkerMessage> = new Subject()

  constructor(name: string, url: string) {
    this.name = name
    this.url = url
    this.worker = new Worker(`dannn://import.extension/${url}?name=${name}`, {
      type: 'module',
    })

    this.worker.onmessage = (e) => {
      this.subject.next(e.data)
    }

    this.worker.onerror = (e) => {
      this.subject.next({
        type: 'error',
        error: e.message,
      })
    }

    this.worker.onmessageerror = (e) => {
      this.subject.next({
        type: 'error',
        error: e.data,
      })
    }

    this.subject.pipe(filter(message => 'type' in message)).subscribe(this.onMessage.bind(this))
  }

  toMessageObservable() {
    return this.subject.pipe(filter(message => 'type' in message))
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }

  private handleDone() {
    this.isReady = true
    if (this.donePromiser) {
      this.donePromiser.resolve()
      this.donePromiser = null
    }
  }

  private handleCallResult(message: WorkerCallResultMessage) {
    const promiser = this.promiserMap.get(message.id)
    if (promiser) {
      promiser.resolve(message.result)
    }
  }

  private handleError(message: WorkerCallErrorMessage) {
    const promiser = this.promiserMap.get(message.id)
    if (promiser) {
      promiser.reject(new Error(message.error))
    }
  }

  private handleModule(message: WorkerModuleMessage) {
    this.readyMethodsName.add(message.name)
  }

  private handleCall(message: WorkerCallMessage) {
    const { id, args, name } = message
    const handler = this.handlers.get(name)
    if (handler) {
      Promise.resolve(handler.apply(this, [args[0], ...args.slice(1)]))
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

  waitReady() {
    if (this.isReady) {
      return Promise.resolve()
    }
    else {
      this.donePromiser = Promise.withResolvers<void>()
      return this.donePromiser.promise
    }
  }

  private onMessage(message: WorkerMessage) {
    switch (message.type) {
      case 'done':
        this.handleDone()
        break
      case 'call-result':
        this.handleCallResult(message)
        break
      case 'call-error':
        this.handleError(message)
        break
      case 'module':
        this.handleModule(message)
        break
      case 'call':
        this.handleCall(message)
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

  expose(name: string, handler: (arg1: any, ...args: any[]) => void) {
    if (this.isWorkerLoaded) {
      this.postMessage({
        type: 'expose',
        name,
      })
    }
    this.handlers.set(name, handler)
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

  postMessage(message: any) {
    if (this.worker) {
      this.worker.postMessage(message)
    }
  }
}
