import type { DnWorkerEvents } from '../types/worker'
import { DnEvent } from '../common/event'

export class DnWorker extends DnEvent<DnWorkerEvents> {
  private worker: Worker | null = null
  private isReady = false
  name: string
  url: string

  constructor(name: string, url: string) {
    console.log('DnWorker', name, url)
    super()
    this.name = name
    this.url = url
    this.worker = new Worker(`dannn://loader.extension/${url}?name=${name}`, {
      type: 'module',
    })
    this.worker.onmessage = (e) => {
      console.log('worker message', e)
    }

    this.worker.onerror = (e) => {
      console.error('worker error', e)
    }
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
