import type { IExtensionConfig } from './extension'
import type { Window } from './window'
import { readdir } from 'node:fs/promises'
import { ipcMain } from 'electron'
import { join } from 'pathe'
import { setEnv } from '~/node/database/service/kv'
import { EXTENSIONS_ROOT } from '../../constant'
import { ExtensionProcess } from './extension'
import { logger } from './logger'

export interface ExtensionMetafile {
  packageJson: IExtensionConfig
  readme?: string
  path: string
}

export class ExtensionHub {
  static readonly hub: Map<string, ExtensionProcess> = new Map()

  constructor() {
    ipcMain.handle('extension.get-all-metafiles', async () => {
      return await this.getAllExtensionMetafiles()
    })

    ipcMain.handle('extension.set-env-value', async (_, item: { name: string, key: string, value: string }) => {
      await setEnv(item.key, item.value)
      // TODO: 这里需要重新加载扩展
      // const subprocess = ExtensionHub.hub.get(item.name)
    })
  }

  loader(window: Window) {
    return new Promise<void>((resolve, reject) => {
      readdir(EXTENSIONS_ROOT)
        .then((dirs) => {
          for (const dir of dirs) {
            const extensionPath = join(EXTENSIONS_ROOT, dir)
            logger.info(`Loading extension: ${extensionPath}`)
            const subprocess = new ExtensionProcess(extensionPath, window)
            ExtensionHub.hub.set(subprocess.getId(), subprocess)
          }

          logger.info(`Loaded ${ExtensionHub.hub.size} extensions`)
          resolve()
        })
        .catch((err) => {
          logger.error('Error loading extensions:', err)
          reject(err)
        })
    })
  }

  async getAllExtensionMetafiles(): Promise<ExtensionMetafile[]> {
    return await Promise.all(
      ExtensionHub.hub.values().map(async (subprocess: ExtensionProcess) => {
        return await subprocess.getMetafile() as ExtensionMetafile
      }),
    )
  }

  async startAll() {
    logger.info('Starting all extensions...')
    for (const subprocess of ExtensionHub.hub.values()) {
      try {
        await subprocess.start?.()
        logger.info(`Started extension: ${subprocess.getId()}`)
      }
      catch (err) {
        logger.error(`Error starting extension ${subprocess.getId()}:`, err)
      }
    }
  }

  async unloadAll() {
    for (const [id, subprocess] of ExtensionHub.hub.entries()) {
      try {
        subprocess.close?.()
      }
      catch (err) {
        logger.error(`Error unloading extension ${id}:`, err)
      }
    }
    ExtensionHub.hub.clear()
  }
}
