import type { RxDatabase } from 'rxdb'
import { addRxPlugin, createRxDatabase } from 'rxdb/plugins/core'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'

export class Database {
  private static instance: Database
  database: RxDatabase | undefined

  constructor() {}

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  async initDatabase() {
    addRxPlugin(RxDBDevModePlugin)
    this.database = await createRxDatabase({
      name: 'dannn',
      storage: wrappedValidateAjvStorage({
        storage: getRxStorageDexie(),
      }),
    })
  }
}
