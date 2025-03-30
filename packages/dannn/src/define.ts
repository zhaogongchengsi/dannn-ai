import { Window } from './window' 

export interface ExtensionModules {
	activate: () => void
	deactivate: () => void
}

export interface ExtensionContext {
	window: Window
}

export function defineExtension(func: (ctx: ExtensionContext) => void) {
	if (typeof func !== 'function') {
		throw new Error('Extension must be a function')
	}

	const window = new Window()
	
	function activate() {
		try {
			func({
				window,
			})
		} catch (e) {
			console.error('Error while activating extension:', e)
		}
	}

	function deactivate() {}

	return {
		activate,
		deactivate
	}
}