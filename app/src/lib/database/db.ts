import type { Table } from 'dexie'
import type { ChatMessage } from './schema'
import Dexie from 'dexie'
import { dbChatMessageSchemaV1 } from './schema'

export class ChatDatabase extends Dexie {
  messages!: Table<ChatMessage, number>
  constructor() {
    super('dannn-database')
    this.version(1).stores({
      messages: dbChatMessageSchemaV1,
    })
  }
}
