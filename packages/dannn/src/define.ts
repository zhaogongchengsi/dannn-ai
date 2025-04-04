import { AIConfig, aiConfig } from '@dannn/schemas'
import { Window } from './window'
import { SelfWorker } from './worker'
import { isIdValid } from './utils'
import { AI } from './ai'

export interface ExtensionContext {
	window: Window
	registerAI(ai: AIConfig): Promise<AI>
}

export function defineExtension(func: (ctx: ExtensionContext) => void | Promise<void>) {
	if (typeof func !== 'function') {
		throw new Error('Extension must be a function')
	}

	const selfWorker = new SelfWorker()
	const window = new Window(selfWorker)

	async function registerAI(ai: AIConfig) {
		const { success, error, data } = aiConfig.safeParse(ai)
		if (!success) {
			console.error('Invalid AI config:', error.format())
			return
		}

		if (!isIdValid(ai.name)) {
			console.error('Invalid AI name:', ai.name)
			return
		}

		try {
			const newAi = await selfWorker.invoke<{ id: string }>('registerAI', data)
			return new AI(newAi.id, selfWorker, data)
		} catch (e) {
			throw new Error('Error while registering AI: ' + e)
		}
	}

	async function activate() {
		try {
			await func({
				window,
				registerAI
			})
		} catch (e) {
			console.error('Error while activating extension:', e)
		}
	}

	function deactivate() { }

	selfWorker.expose('activate', activate)
	selfWorker.expose('deactivate', deactivate)
}