import type { AIData, MakeFieldsOptional, RoomData } from '../../../common/types'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { ais, chatParticipants, rooms } from '../schema'

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
  const roomsWithAis = await db
    .select({
      room: rooms,
      ai: ais,
    })
    .from(rooms)
    .leftJoin(chatParticipants, eq(rooms.id, chatParticipants.roomId))
    .leftJoin(ais, eq(chatParticipants.aiId, ais.name))
    .all()

  const groupedRooms = roomsWithAis.reduce((acc, { room, ai }) => {
    const existingRoom = acc.find(r => r.id === room.id)
    if (existingRoom) {
      if (ai) {
        existingRoom.participant.push(ai)
      }
    }
    else {
      acc.push({
        ...room,
        participant: ai ? [ai] : [],
      })
    }
    return acc
  }, [] as RoomData[])

  return groupedRooms
}

export async function getRoomById(id: number): Promise<RoomData | undefined> {
  const room = await db.select().from(rooms).where(eq(rooms.id, id)).get()
  if (!room) {
    return undefined
  }

  const aiList = await db
    .select({
      ai: ais,
    })
    .from(rooms)
    .leftJoin(chatParticipants, eq(rooms.id, chatParticipants.roomId))
    .leftJoin(ais, eq(chatParticipants.aiId, ais.name))
    .where(eq(rooms.id, id))
    .all()

  return {
    ...room,
    participant: aiList.map(({ ai }) => ai!),
  }
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
