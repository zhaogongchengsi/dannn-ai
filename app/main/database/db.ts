import type { LibSQLDatabase } from 'drizzle-orm/libsql/driver-core'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { drizzle } from 'drizzle-orm/libsql/sqlite3'

export function initDB(url: string) {
  return drizzle({
    connection: url,
  })
}

export async function migrateDb(db: LibSQLDatabase<Record<string, unknown>>, dir: string) {
  await migrate(db, {
    migrationsFolder: dir,
  })
}
