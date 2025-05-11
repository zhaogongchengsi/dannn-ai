import process from 'node:process'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { drizzle } from 'drizzle-orm/libsql/sqlite3'
import { app } from 'electron'
import { logger } from 'main/lib/logger'
import { dirname, normalize, resolve } from 'pathe'

function getDatabaseFilePath() {
  if (app.isPackaged) {
    return dirname(app.getPath('exe'))
  }
  else {
    return process.cwd()
  }
}

function getDatabaseMigrate() {
  if (app.isPackaged) {
    return resolve(process.resourcesPath, 'drizzle')
  }
  else {
    return resolve(__dirname, '../drizzle')
  }
}

const url = `file:///${normalize(resolve(getDatabaseFilePath(), './sqlite.db'))}`

logger.info('Database URL:', url)

export const db = drizzle({
  connection: url,
})

export async function migrateDb() {
  const dir = getDatabaseMigrate()
  logger.info('Database migrate path:', dir)
  await migrate(db, {
    migrationsFolder: dir,
  })
}
