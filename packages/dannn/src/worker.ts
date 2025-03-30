import Event from "./event";

export type WorkerFromWindowResultMessage = {
	id: string
	result: any
	error: string
	type: 'call-result-from-window'
}

export type WorkerFromWindowCallMessage = {
	id: string
	name: string
	type: 'call'
	args: any[]
}

export type WorkerFromWindowMessage = WorkerFromWindowResultMessage | WorkerFromWindowCallMessage

export type WorkerEvent = {
	'message': WorkerFromWindowMessage
}

export class BaseWorker<Event> extends Event<WorkerEvent & Event> {
	// @ts-ignore
	private promiserMap = new Map<string, PromiseWithResolvers<any>>()
	private handlers = new Map<string, (...args: any[]) => void>()
	constructor() {
		super();
		self.addEventListener('message', this.onMessage.bind(this));
	}

	expose(name: string, handler: (arg1: any, ...args: any[]) => void) {
		this.postMessage({ type: 'module', name: name })
		this.handlers.set(name, handler)
	}

	private onMessage(message: any) {
		const data = message.data as WorkerFromWindowMessage
		if (!('type' in message.data)) {
			return
		}
		
		if (data.type === 'call-result-from-window') {
			const { id, result, error } = data
			const promiser = this.promiserMap.get(id)
			if (promiser) {
				if (result) {
					promiser.resolve(result)
				}
				if (error) {
					promiser.reject(new Error(error))
				}
			}
			return
		}
		

		if (data.type === 'call') {
			const { id, name, args } = data
			const handler = this.handlers.get(name)
			if (handler) {
				Promise.resolve(handler.apply(undefined, args))
					.then((result) => {
						this.postMessage({
							type: 'call-result',
							id,
							result,
						})
					})
					.catch((error) => {
						this.postMessage({
							type: 'call-error',
							id,
							error: error.message,
						})
					})
			}
		}

	}

	private generateId() {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
	}

	private postMessage(data: any) {
		self.postMessage(data)
	}

	invoke<T>(method: string, ...args: any[]): Promise<T> {
		const id = this.generateId()
		// @ts-ignore
		const promiser =  Promise.withResolvers<T>()
		this.promiserMap.set(id, promiser)
		this.postMessage({
			type: 'call',
			id,
			name: method,
			args,
		})
		return promiser.promise
	}

	done() {
		this.postMessage({
			type: 'done',
		})
	}
}