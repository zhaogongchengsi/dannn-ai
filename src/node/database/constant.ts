import process from 'node:process'
import { app } from 'electron'
import { dirname, normalize, resolve } from 'pathe'

export const databaseUrl = `file:///${normalize(resolve(app.isPackaged ? dirname(app.getPath('exe')) : process.cwd(), './sqlite.db'))}`
