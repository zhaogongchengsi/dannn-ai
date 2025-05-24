import { join } from 'node:path'
import process from 'node:process'
import { app } from 'electron'

export const APP_DATA_PATH = MODE === 'dev' ? join(process.cwd(), '.dannn') : join(app.getPath('userData'), '.dannn')
export const EXTENSIONS_ROOT = MODE === 'dev' ? join(process.cwd(), 'extensions') : join(app.getPath('userData'), '.dannn', 'extensions')
export const PROTOCOL_NAME = 'dannn'
