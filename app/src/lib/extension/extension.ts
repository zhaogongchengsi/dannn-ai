import type { Extension } from '../schemas/extension'
import { Event } from '../event'

export interface ExtensionEvents {
  message: MessageEvent
  error: ErrorEvent
}

export class ExtensionInstance extends Event<ExtensionEvents> {
  config: Extension
  worker: Worker | null = null
  constructor(ext: Extension) {
    super()
    this.config = ext
  }

  load() {
    return new Promise<void>((resolve) => {
      if (!this.config.main) {
        resolve()
        return
      }
      const { main, name } = this.config
      const worker = new Worker(`dannn://loader.extension/${main}?name=${name}`, { type: 'module' })
      this.worker = worker
      worker.addEventListener('message', (event) => {
        this.emit('message', event)
      })
      worker.addEventListener('error', (event) => {
        this.emit('error', event)
      })
      resolve()
    })
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
    }
  }

  postMessage(message: any, options?: StructuredSerializeOptions) {
    if (this.worker) {
      this.worker.postMessage(message, options)
    }
  }
}
