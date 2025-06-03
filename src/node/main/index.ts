import process from 'node:process'
import { app, screen } from 'electron'
import { migrateDb } from '../database/db'
import { roomExists } from '../database/service/room'
import { initAutoUpdater } from './autoupdater'
import { Config } from './lib/config'
import { ExtensionHub } from './lib/hub'
import { logger } from './lib/logger'
import { Window } from './lib/window'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const gotSingleInstanceLock = app.requestSingleInstanceLock()

if (!gotSingleInstanceLock) {
  app.quit()
}

app.whenReady().then(initAutoUpdater)

const config = new Config()
const extensionHub = new ExtensionHub()
const window = new Window()

async function bootstrap() {
  logger.info('Bootstrap...')

  await config.init()

  app.on('before-quit', () => {
    extensionHub.unloadAll()
  })

  app.on('second-instance', () => {
    logger.info('Second instance detected. Bringing the main window to the front.')
    if (window.isMinimized()) {
      window.restore()
    }
    window.focus()
  })

  const windowConfig = config.get('window')

  migrateDb()
    .then(async () => {
      // 加载插件并且把窗口传入插件
      extensionHub.loader(window)
        .then(() => {
          extensionHub.startAll()
        })

      // 获取屏幕的工作区域
      const { width, height } = getDisplayRatioWithSize()

      await window.display({
        width: windowConfig?.width ?? width,
        height: windowConfig?.height ?? height,
        currentUrl: await getDefaultRoute()
          .catch((err) => {
            logger.error('Failed to get default route:', err)
            return ''
          }),
      })

      await window.show()
    })
    .catch((err) => {
      logger.error('Database migration failed:', err)
      // 如果迁移失败，可能是数据库损坏或不兼容，直接退出应用
      app.quit()
    })
}

window.on('resized', async () => {
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

app.on('quit', () => {
  logger.info('App is quitting...')
})

;['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => {
    logger.info(`Received ${signal}. Exiting...`)
    app.quit()
  })
})

function getDisplayRatioWithSize() {
  // 获取屏幕的工作区域
  const primaryDisplay = screen.getPrimaryDisplay()
  const scaleFactor = primaryDisplay.scaleFactor || 1 // 默认值为 1
  const { width, height } = primaryDisplay.workAreaSize
  const displayRatio = {
    width: Math.round(width / scaleFactor),
    height: Math.round(height / scaleFactor),
  }
  return displayRatio
}

async function getDefaultRoute() {
  const currentChatId = Number(config.get('currentChatId'))

  if (!currentChatId === undefined || currentChatId === null || currentChatId === 0 || Number.isNaN(currentChatId)) {
    return ''
  }

  // 检查当前聊天 ID 是否存在对应的房间 防止路由错误
  if (await roomExists(currentChatId)) {
    return `#/chat/${currentChatId}`
  }

  return '#/chat' // 如果没有找到对应的房间，则返回空字符串
}
