import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { ipcMain } from 'electron'
import { fork } from 'child_process';
import { EXTENSIONS_ROOT } from './constant'
import { Config } from './lib/config'
import { Window } from './lib/window'
import { createDannnProtocol } from './protocol'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const config = new Config()
const window = new Window()

const _dirname = dirname(fileURLToPath(import.meta.url))

const serverPath = resolve(_dirname, 'server.js')

console.log(`serverPath`, serverPath)

const server = fork(serverPath, [], {
  cwd: process.cwd(),
  stdio: 'inherit',
})

server.on('message', (message) => {
  console.log('server message', message)
})

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

window.on('window.resized', async () => {
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

ipcMain.handle('env.get', async (_, keys: string[]) => {
  const result: Record<string, string | undefined> = {}
  for (const key of keys) {
    result[key] = process.env[key]
  }
  return result
})

bootstrap()
