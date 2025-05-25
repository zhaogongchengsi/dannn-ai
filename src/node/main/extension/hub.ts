import type { Window } from '../lib/window'
import { readdir } from 'node:fs/promises'
import { join } from 'pathe'
import { EXTENSIONS_ROOT } from '../constant'
import { logger } from '../lib/logger'
import { ExtensionProcess } from './extension'

export class ExtensionHub {
  static readonly hub: Map<string, ExtensionProcess> = new Map()

  constructor() { }

  async loader(window: Window) {
    readdir(EXTENSIONS_ROOT)
      .then((dirs) => {
        for (const dir of dirs) {
          const subprocess = new ExtensionProcess(join(EXTENSIONS_ROOT, dir), window)
          ExtensionHub.hub.set(subprocess.getId(), subprocess)
        }
      })
      .catch((err) => {
        logger.error('Error loading extensions:', err)
      })
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
