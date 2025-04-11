import type { MakeFieldsOptional } from '../../../common/types'
import { db } from '../db'
import { rooms } from '../schema'

export type InfoRoom = typeof rooms.$inferSelect

export type InsertChat = Pick<InfoRoom, 'title' | 'avatar' | 'description'>

export async function insertRoom(chat: MakeFieldsOptional<InsertChat, 'description' | 'avatar'>) {
  return await db.insert(rooms).values({
    ...chat,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: 0,
    isFavorite: 0,
    isLocked: 0,
    isPinned: 0,
    isArchived: 0,
  }).returning()
}
