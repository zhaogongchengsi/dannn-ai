import { app } from 'electron'
import { Config } from './lib/config'
import { Loader } from './lib/loader'
import { Window } from './lib/window'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

const loader = new Loader()
const config = new Config()
const window = new Window()

async function bootstrap() {
  await window.display()
  await loader.init()
  await config.init()
  await window.show()
}

bootstrap()
