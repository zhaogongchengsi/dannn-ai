import { app } from 'electron'
import { Window } from './lib/window'
import { Loader } from './lib/loader'
import { Config } from './lib/config'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

if (!app.requestSingleInstanceLock()) {
	app.quit()
}

const window = new Window()
const loader = new Loader()
const config = new Config()

async function bootstrap() {
	loader.init()
	config.init()

	await window.show()
}

bootstrap()
