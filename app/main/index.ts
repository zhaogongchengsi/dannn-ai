import { app } from 'electron'
import { withAsyncContext } from './lib/context'
import { Hook } from './lib/hook'
import { Window } from './lib/window'
import { Loader } from './lib/loader'
import { Config } from './lib/config'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

if (!app.requestSingleInstanceLock()) {
	app.quit()
}

const window = new Window()
const hook = new Hook()
const loader = new Loader()
const config = new Config()

async function bootstrap() {
	loader.init()
	config.init()

	withAsyncContext({
		hook,
		window,
		loader,
		config,
	}, async () => {
		await window.show()
	})
}

bootstrap()
