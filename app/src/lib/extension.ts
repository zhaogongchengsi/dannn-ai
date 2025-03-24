import { Event } from './event'

export type ExtensionEvents = {
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

	load(){
		return new Promise<void>((resolve, reject) => {
			if (!this.config.clientEntry) {
				resolve()
				return
			}
			const { clientEntry, name } = this.config
			const worker = new Worker(`dannn://loader.extension/${clientEntry}?name=${name}`, { type: 'module' })
			this.worker = worker
			worker.onmessage = (event) => {
				this.emit('message', event)
			}
			worker.onerror = (event) => {
				this.emit('error', event)
			}
			resolve()
		})
	}


	terminate(){
		if (this.worker) {
			this.worker.terminate()
		}
	}

	postMessage(message: any, options?: StructuredSerializeOptions){
		if (this.worker) {
			this.worker.postMessage(message, options)
		}
	}
}