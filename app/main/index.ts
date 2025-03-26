import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { ipcMain } from 'electron'
import { EXTENSIONS_ROOT } from './constant'
import { Config } from './lib/config'
import { validate } from './lib/schema'
import { Window } from './lib/window'
import { createDannnProtocol } from './protocol'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const config = new Config()
const window = new Window()

async function bootstrap() {
  createDannnProtocol()
  await config.init()

  const windowConfig = config.get('window')

  await window.display({
    width: windowConfig?.width,
    height: windowConfig?.height,
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

ipcMain.handle('constants.EXTENSIONS_ROOT', async () => {
  if (existsSync(EXTENSIONS_ROOT)) {
    return EXTENSIONS_ROOT
  }
  return await mkdir(EXTENSIONS_ROOT, { recursive: true })
})
ipcMain.handle('validate', (_, value: string) => {
  return validate(JSON.parse(value))
})

bootstrap()
