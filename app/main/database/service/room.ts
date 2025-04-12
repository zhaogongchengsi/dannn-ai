import type { MakeFieldsOptional, RoomData } from '../../../common/types'
import { eq } from 'drizzle-orm'
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
  }).returning().get()
}

export async function getAllRooms(): Promise<RoomData[]> {
  return await db.select().from(rooms).all()
}

export async function getRoomById(id: number): Promise<RoomData | undefined> {
  return await db.select().from(rooms).where(eq(rooms.id, id)).get()
}

export async function updateRoomById(
  id: number,
  updates: Partial<InsertChat>,
) {
  return await db
    .update(rooms)
    .set({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(rooms.id, id))
}

export async function deleteRoomById(id: number) {
  await db.delete(rooms).where(eq(rooms.id, id))
}
