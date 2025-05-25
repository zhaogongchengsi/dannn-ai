import type { ExtensionProcess } from './extension/extension'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { app, ipcMain } from 'electron'
import { migrateDb } from '../database/db'
import { EXTENSIONS_ROOT } from './constant'
import { Config } from './lib/config'
import { logger } from './lib/logger'
import { Window } from './lib/window'
import { ExtensionHub } from './extension/hub'

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err)
  app.quit()
})

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

// const ipc = new MainIpc()
const extensionHub = new ExtensionHub()
const config = new Config()
const window = new Window()
let extensionProcessList: ExtensionProcess[] | null = null

const gotSingleInstanceLock = app.requestSingleInstanceLock()

if (!gotSingleInstanceLock) {
  app.quit()
}

// ipcMain.on('trpc:message', (_, args) => {
//   logger.info('trpc:message', args)
// })

async function bootstrap() {
  logger.info('Bootstrap...')

  await migrateDb()

  await config.init()

  app.on('before-quit', () => {
    // server.stop()
    extensionProcessList?.forEach((extension) => {
      extension.close()
    })
  })

  const windowConfig = config.get('window')

  extensionHub.loader()

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

process.on('SIGINT', () => {
  // 执行清理操作，例如关闭所有窗口
  app.quit()
})

process.on('SIGTERM', () => {
  app.quit()
})
