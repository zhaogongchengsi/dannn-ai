import { protocol, app } from 'electron'

export class Ipc {
	name = 'dannn'
	handlerMap = new Map<string, Function>()
	constructor() {}

	async init() {
		protocol.registerSchemesAsPrivileged([
			{ 
				scheme: this.name, 
				privileges: { 
					standard: true, 
					secure: true, 
					supportFetchAPI: true, 
					stream: true, 
					corsEnabled: true 
				} 
			},
		])

		await app.whenReady()

		protocol.handle(this.name, async (request) => {
			const url = request.url
			const { pathname, searchParams } = new URL(url)

			console.log('pathname:', pathname, 'searchParams:', searchParams)

			return new Response('Hello World')
		})
	}

	register(name: string, handler: Function) {
		this.handlerMap.set(name, handler)
	}
}