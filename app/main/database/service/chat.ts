import { db } from '../db'
import { chats } from '../schema'

export type InfoChat = typeof chats.$inferSelect

export type InsertChat = Pick<InfoChat, 'title' | 'avatar' | 'description'>

export async function insertChat(chat: InsertChat) {
  return await db.insert(chats).values({
    ...chat,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: 0,
    isFavorite: 0,
    isLocked: 0,
    isPinned: 0,
    isArchived: 0,
  })
}
