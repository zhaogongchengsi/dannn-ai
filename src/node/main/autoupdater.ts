import { createRequire } from 'node:module'
import { app, dialog } from 'electron'
import { logger } from './lib/logger'

const requireLogger = createRequire(import.meta.url)
export const { autoUpdater }: typeof import('electron-updater') = requireLogger('electron-updater')

// const server = 'https://update.electronjs.org'
// const feed = `${server}/zhaogongchengsi/dannn-ai/${app.getVersion()}`

export function initAutoUpdater() {
  logger.info('Initializing auto updater...')

  autoUpdater.setFeedURL({
    provider: 'github',
    repo: 'dannn-ai',
    owner: 'zhaogongchengsi',
    private: false,
    releaseType: 'release',
    vPrefixedTagName: true,
  })

  autoUpdater.autoDownload = app.isPackaged

  autoUpdater.on('error', (error) => {
    logger.error('Auto updater error:', error)
    dialog.showMessageBox({
      type: 'error',
      title: 'Update Error',
      message: `An error occurred while checking for updates: ${error.message}`,
    })
  })

  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for updates...')
  })

  autoUpdater.on('update-not-available', () => {
    logger.info('No updates available.')
  })

  autoUpdater.on('update-available', () => {
    logger.info('Update available. Downloading now...')
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. Downloading now...',
    })
  })

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Downloaded',
      message: 'A new version has been downloaded. Restart the app to apply the update.',
      buttons: ['Restart', 'Later'],
    }).then((result) => {
      logger.info('Update downloaded. User response:', result.response)
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const log_message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent
    }% (${progressObj.transferred}/${progressObj.total})`
    logger.info(log_message)

    dialog.showMessageBox({
      type: 'info',
      title: 'Downloading Update',
      message: log_message,
    })
  })

  autoUpdater.forceDevUpdateConfig = true

  autoUpdater.checkForUpdates()

  logger.info('Auto updater initialized.')
}
