import process from 'node:process'
import { app } from 'electron'
import { join, normalize, resolve } from 'pathe'

export const databaseUrl = `file:///${normalize(resolve(app.isPackaged ? join(app.getPath('home'), '.dannn') : process.cwd(), './sqlite.db'))}`
