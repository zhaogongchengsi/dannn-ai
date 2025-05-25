import type { BridgeRequest } from '~/common/bridge'
import { Bridge } from '~/common/bridge'

export class Ipc extends Bridge {
  parentPort?: import('worker_threads').MessagePort
  static readonly isWindows = typeof window !== 'undefined' && 'dannn' in window
  constructor() {
    super()
    if (Ipc.isWindows) {
      window.dannn.ipc.on('trpc:message', (_, data: BridgeRequest) => {
        this.onMessage(data)
      })
    }
    else {
      import('node:worker_threads').then(({ parentPort }) => {
        if (parentPort) {
          this.parentPort = parentPort
          parentPort.on('message', (data: BridgeRequest) => {
            this.onMessage(data)
          })
        }
      })
    }
  }

  send(data: BridgeRequest): void {
    if (Ipc.isWindows) {
      window.dannn.ipc.send('trpc:message', data)
    }
    else {
      if (this.parentPort) {
        this.parentPort.postMessage(data)
      }
      else {
        import('node:worker_threads').then(({ parentPort }) => {
          if (parentPort) {
            this.parentPort = parentPort
            parentPort?.postMessage(data)
          }
        })
      }
    }
  }
}
