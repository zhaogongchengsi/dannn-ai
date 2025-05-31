import process from 'node:process'
import { app } from 'electron'
import { migrateDb } from '../database/db'
import { Config } from './lib/config'
import { ExtensionHub } from './lib/hub'
import { logger } from './lib/logger'
import { Window } from './lib/window'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
const gotSingleInstanceLock = app.requestSingleInstanceLock()

if (!gotSingleInstanceLock) {
  app.quit()
}

const config = new Config()
const extensionHub = new ExtensionHub()
const window = new Window()

async function bootstrap() {
  logger.info('Bootstrap...')

  await migrateDb()

  await config.init()

  app.on('before-quit', () => {
    extensionHub.unloadAll()
  })

  const windowConfig = config.get('window')

  // 加载插件并且把窗口传入插件
  extensionHub.loader(window)
    .then(() => {
      extensionHub.startAll()
    })

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

bootstrap()

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', reason, 'Promise:', promise)
})

;['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => {
    app.quit()
  })
})
