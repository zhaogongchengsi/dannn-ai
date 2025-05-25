import { Bridge, BridgeRequest } from "~/common/bridge"
import { parentPort } from 'worker_threads';
import { isWindows } from 'std-env'

export class Ipc extends Bridge {
	constructor() {
		super()

		if (isWindows) {
			window.dannn.ipc.on('')
		}

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