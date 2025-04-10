import { migrate } from 'drizzle-orm/libsql/migrator'
import { drizzle } from 'drizzle-orm/libsql/sqlite3'
import { app } from 'electron'
import { normalize, resolve } from 'pathe'

const url = `file:///${normalize(resolve(app.getAppPath(), './sqlite.db'))}`

export const db = drizzle({
  connection: url,
})

export async function migrateDb() {
  const dir = resolve(app.getAppPath(), './drizzle')
  await migrate(db, {
    migrationsFolder: dir,
  })
}
