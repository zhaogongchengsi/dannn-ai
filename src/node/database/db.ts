import process from 'node:process'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { drizzle } from 'drizzle-orm/libsql/sqlite3'
import { app } from 'electron'
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
    return resolve(process.cwd(), 'drizzle')
  }
}

const url = `file:///${normalize(resolve(getDatabaseFilePath(), './sqlite.db'))}`

export const db = drizzle({
  connection: url,
})

export async function migrateDb() {
  const dir = getDatabaseMigrate()
  await migrate(db, {
    migrationsFolder: dir,
  })
}
