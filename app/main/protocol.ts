import { protocol, app } from "electron";
import { join } from "pathe";
import { existsSync } from 'node:fs'
import { readFile } from 'fs/promises'

export async function createDannnProtocol() {
	protocol.registerSchemesAsPrivileged([
		{ scheme: 'dannn', privileges: { secure: true, standard: true, stream: true, supportFetchAPI: true, corsEnabled: true } },
	])

	const extensionRoot = join(app.getPath('userData'), '.dannn', 'extensions')
	
	await app.whenReady()

	protocol.handle('dannn', async (request) => {
		const url = new URL(request.url)

		console.log(url)

		if (url.hostname === 'loader.extension') {
			const script = loadScript({ url: url.pathname + url.search })
			const response = createScriptResponse(script)
			return response
		}

		if (url.hostname === 'import.extension') {
			// return createScriptResponse(`export function test() { console.log('test') }`)

			const name = url.searchParams.get('name')
			if (!name) {
				return new Response('Worker Missing name', {
					status: 400,
					statusText: 'Worker Missing name',
				})
			}

			const filePath = join(extensionRoot, name,  url.pathname)

			if (!['.js', '.cjs', '.mjs'].some((ext) => filePath.endsWith(ext))) {
				return new Response('Worker Invalid extension', {
					status: 400,
					statusText: 'Worker Invalid extension',
				})
			}

			if (!existsSync(filePath)) {
				return new Response('Worker Not found', {
					status: 404,
					statusText: 'Worker Not found ' + filePath,
				})
			}

			const scriptContent = await readFile(filePath, 'utf-8')

			return createScriptResponse(scriptContent)
		}

		return new Response('Not found', {
			status: 404,
			statusText: `Not found: ${url.hostname}`,
		})
	})
}



function createScriptResponse(code: string): Response {
	const blob = new Blob([code], { type: "application/javascript" });
	return new Response(blob, {
		status: 200,
		statusText: 'OK',
		headers: {
			'Content-Type': `application/javascript; charset=utf-8`,
			'Access-Control-Allow-Origin': '*', // 允许 CORS
			'Cache-Control': 'no-store', // 防止 Worker 缓存
		},
	})
}

export function loadScript({ url }: { url: string }) {
return `const modules = await import('dannn://import.extension' + ${JSON.stringify(url)})
Object.keys(modules).forEach((key) => {
	self.postMessage({ type: 'module', name: key })
})
	self.onmessage = (event) => {
		const { type, data } = event.data
		if (type === 'call') {
				const { name, args, id } = data
				if (modules[name]) {
					Promise.resolve(modules[name](...args))
						.then((result) => {
							self.postMessage({ type: 'result', id, result })
						})
						.catch((error) => {
							self.postMessage({ type: 'error', id, error })
						})
		} else {
			self.postMessage({ type: 'error', id, error: 'Module not found' })
		}
	}
}
self.postMessage({ type: 'done' })`
}

function getMimeType(filePath: string): string {
	if (filePath.endsWith('.js')) {
		return 'application/javascript'
	} else if (filePath.endsWith('.html')) {
		return 'text/html'
	} else if (filePath.endsWith('.css')) {
		return 'text/css'
	} else if (filePath.endsWith('.json')) {
		return 'application/json'
	} else if (filePath.endsWith('.png')) {
		return 'image/png'
	} else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
		return 'image/jpeg'
	}
	// Add more MIME types as needed
	return 'text/plain'
}

/**
 * Object.keys(modules).forEach((key) => {
			self.postMessage({ type: 'module', name: key })
		})
		self.onmessage = (event) => {
			const { type, data } = event.data
			if (type === 'call') {
				const { name, args, id } = data
				if (modules[name]) {
					Promise.resolve(modules[name](...args))
						.then((result) => {
							self.postMessage({ type: 'result', id, result })
						})
						.catch((error) => {
							self.postMessage({ type: 'error', id, error })
						})
				} else {
				 	self.postMessage({ type: 'error', id, error: 'Module not found' })
				}
			}
		}
 */