import { Bridge, BridgeRequest } from "~/common/bridge"

const isWindows = typeof window !== 'undefined' && 'dannn' in window

export class Ipc extends Bridge {
	parentPort?: import('worker_threads').MessagePort
	constructor() {
		super()
		if (isWindows) {
			window.dannn.ipc.on('trpc:message', (_, data: BridgeRequest) => {
				this.onMessage(data)
			})
		}
		else {
			import('worker_threads').then(({ parentPort }) => {
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
		console.log('send', data)
		if (isWindows) {
			console.log('send to windows', data)
			window.dannn.ipc.send('trpc:message', data)
		}
		else {
			if (this.parentPort) {
				this.parentPort.postMessage(data)
			} else {
				import('worker_threads').then(({ parentPort }) => {
					if (parentPort) {
						this.parentPort = parentPort
						parentPort?.postMessage(data)
					}
				})
			}
		}
	}
}