import Event from "./event";
import { WorkerMessage, WorkerCallFunctionMessage, WorkerEventEmitMessage } from '@dannn/schemas'

export class BaseWorker<E> extends Event<E> {
	// @ts-ignore
	private promiserMap = new Map<string, PromiseWithResolvers<any>>()
	private handlers = new Map<string, (...args: any[]) => void>()
	constructor() {
		super();
		self.addEventListener('message', this.onMessage.bind(this));
	}

	expose(name: string, handler: (arg1: any, ...args: any[]) => void) {
		this.handlers.set(name, handler)
	}

	private onMessage(message: any) {
		const data = message.data as WorkerMessage
		if (!('type' in message.data)) {
			return
		}

		switch (data.type) {
			case "call-function":
				this.callFunctionHandle(data);
				break
			case "call-function-response":
			case "call-function-error":
				this.handleCallResult(data)
				break
			case "event-emit":
				this.handleEvent(data)
		}
	}

	private handleEvent(data: WorkerEventEmitMessage) {
		const { name, event } = data.data
		this.emit(name as keyof E, event)
	}

	private handleCallResult(data: WorkerMessage) {
		const { id } = data
		if (this.promiserMap.has(id)) {
			const promiser = this.promiserMap.get(id)!
			this.promiserMap.delete(id)
			if (data.type === 'call-function-response') {
				promiser.resolve(data.data.result)
			} else if (data.type === 'call-function-error') {
				promiser.reject(new Error(data.data.error))
			}
		}
	}

	private callFunctionHandle(data: WorkerCallFunctionMessage) {
		const { id } = data
		const { name, args } = data.data
		if (this.handlers.has(name)) {
			const handler = this.handlers.get(name)!
			try {
				const result = handler(...args)
				this.postMessage({
					type: 'call-function-response',
					id,
					data: {
						result,
					},
				})
			} catch (error) {
				this.postMessage({
					type: 'call-function-error',
					id,
					data: {
						error: error.message,
					},
				})
			}
		}
	}

	private generateId() {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
	}

	private postMessage(data: WorkerMessage) {
		self.postMessage(data)
	}

	invoke<T>(name: string, ...args: any[]): Promise<T> {
		const id = this.generateId()
		// @ts-ignore
		const promiser = Promise.withResolvers<T>()
		this.promiserMap.set(id, promiser)
		this.postMessage({
			type: 'call-function',
			id,
			data: {
				name,
				args,
			}
		})
		return promiser.promise
	}

	emitEventToWindow(name: string, event: any) {
		this.postMessage({
			type: 'event-emit',
			data: {
				name,
				event,
			}
		})
	}
}