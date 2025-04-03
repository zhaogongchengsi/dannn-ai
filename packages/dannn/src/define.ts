import { Window } from './window' 
import { BaseWorker } from './worker'

export interface ExtensionContext {
	window: Window
}

export function defineExtension(func: (ctx: ExtensionContext) => void) {
	if (typeof func !== 'function') {
		throw new Error('Extension must be a function')
	}

	const baseWorker = new BaseWorker()

	const window = new Window()
	
	function activate() {
		try {
			func({
				window
			})
		} catch (e) {
			console.error('Error while activating extension:', e)
		}
	}

	function deactivate() {}

	baseWorker.expose('activate',activate)
	baseWorker.expose('deactivate',deactivate)
	baseWorker.done()
}