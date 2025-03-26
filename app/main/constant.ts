import { app } from 'electron'
import { join } from 'pathe'

export const EXTENSIONS_ROOT = join(app.getPath('userData'), '.dannn', 'extensions')
export const PROTOCOL_NAME = 'dannn'
