import { Bridge, BridgeRequest } from "~/common/bridge"
import { parentPort } from 'worker_threads';

export class Ipc extends Bridge {
  constructor() {
	super()
	parentPort?.on('message', (data: BridgeRequest) => {
		this.onMessage(data)
	})

	this.register('ping', () => {
	  return 'pong'
	})
  }

  send(data: BridgeRequest): void {
	parentPort?.postMessage?.(data)
  }
}