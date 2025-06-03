import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { app } from 'electron'
import fse from 'fs-extra'
import { normalize } from 'pathe'

export const userDataDir = join(app.isPackaged ? app.getPath('home') : process.cwd(), '.dannn')

if (!existsSync(userDataDir)) {
  fse.mkdirSync(userDataDir, { recursive: true })
}

export const APP_DATA_PATH = userDataDir
export const EXTENSIONS_ROOT = !app.isPackaged ? join(app.getAppPath(), 'extensions') : join(process.resourcesPath, 'extensions')
export const databaseUrl = `file:///${normalize(join(userDataDir, './sqlite.db'))}`
