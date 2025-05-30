import { join } from 'node:path'
import { app } from 'electron'

export const APP_DATA_PATH = !app.isPackaged ? join(app.getAppPath(), '.dannn') : join(app.getPath('userData'), '.dannn')
export const EXTENSIONS_ROOT = !app.isPackaged ? join(app.getAppPath(), 'extensions') : join(app.getPath('userData'), '.dannn', 'extensions')
export const PROTOCOL_NAME = 'dannn'
