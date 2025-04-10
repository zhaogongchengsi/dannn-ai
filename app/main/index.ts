import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { app, ipcMain } from 'electron'
import { getPort } from 'get-port-please'
import { EXTENSIONS_ROOT } from './constant'
import { Config } from './lib/config'
import { Window } from './lib/window'
import { createServer } from './server/server'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const config = new Config()
const window = new Window()

async function bootstrap() {
  await config.init()

  const port = await getPort({
    port: 52123,
    portRange: [52123, 52223],
    random: true,
  })

  process.env.PORT = String(port)

  const server = createServer(port)

  await server.start()

  app.on('before-quit', () => {
    server.stop()
  })

  console.log(`http server port: ${port}`)

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
