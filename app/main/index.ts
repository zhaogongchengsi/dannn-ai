import process from 'node:process'
import { protocol } from 'electron'
import { Config } from './lib/config'
import { Window } from './lib/window'
import { createDannnProtocol } from './protocol'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

protocol.registerSchemesAsPrivileged([
  { scheme: 'dannn', privileges: { secure: true, standard: true, stream: true, supportFetchAPI: true, corsEnabled: true } },
])

const config = new Config()
const window = new Window()

async function bootstrap() {
  createDannnProtocol()
  await config.init()
  await window.display({
    width: config.get('window').width,
    height: config.get('window').height,
  })
  await window.show()
}

window.on('resized', async () => {
  const { width, height } = window.getSize()
  await config.set('window', {
    width,
    height,
  })
})

bootstrap()
