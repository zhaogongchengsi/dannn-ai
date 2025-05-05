import { createRequire } from 'node:module'

const requireLogger = createRequire(import.meta.url)

export const logger: typeof import('electron-log/main') = requireLogger('electron-log/main')
