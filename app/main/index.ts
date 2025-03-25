import process from 'node:process'
import { protocol } from 'electron'
import { Config } from './lib/config'
import { Loader } from './lib/loader'
import { Window } from './lib/window'
import { createDannnProtocol } from './protocol'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

protocol.registerSchemesAsPrivileged([
  { scheme: 'dannn', privileges: { secure: true, standard: true, stream: true, supportFetchAPI: true, corsEnabled: true } },
])

const loader = new Loader()
const config = new Config()
const window = new Window()

async function bootstrap() {
  createDannnProtocol()
  await window.display()
  await loader.init()
  await config.init()
  await window.show()
}

bootstrap()
