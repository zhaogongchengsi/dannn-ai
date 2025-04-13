import type { AIData, MakeFieldsOptional, RoomData } from '../../../common/types'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { ais, chatParticipants, rooms } from '../schema'
import lodash from 'lodash'

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

export async function getRoomParticipants(roomId: number): Promise<AIData[]> {
  const participants = await db
    .select({
      ais: ais,
    })
    .from(chatParticipants)
    .leftJoin(ais, eq(chatParticipants.aiId, ais.id))
    .where(eq(chatParticipants.roomId, roomId))
    .all()

  return lodash.compact(participants.map(({ ais }) => ais))
}

export async function getAllRooms(): Promise<RoomData[]> {
  const roomsList = await db
    .select()
    .from(rooms)
    .all()

  const groupedRooms = await Promise.all(
    roomsList.map(async room => {
      const participants = await getRoomParticipants(room.id)
      return {
        ...room,
        participant: participants,
      }
    }),
  )

  return groupedRooms
}

export async function getRoomById(id: number): Promise<RoomData | undefined> {
  const room = await db.select().from(rooms).where(eq(rooms.id, id)).get()
  if (!room) {
    return undefined
  }

  const participants = await getRoomParticipants(room.id)

  return {
    ...room,
    participant: participants,
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

export async function addAiToRoom(roomId: number, aiId: number) {
  // Check if the room exists
  const roomExists = await db.select().from(rooms).where(eq(rooms.id, roomId)).get()
  if (!roomExists) {
    throw new Error(`Room with id ${roomId} does not exist`)
  }

  // Check if the AI exists
  const aiExists = await db.select().from(ais).where(eq(ais.id, aiId)).get()
  if (!aiExists) {
    throw new Error(`AI with name ${aiId} does not exist`)
  }

  // Add the AI to the room
  return await db.insert(chatParticipants).values({
    roomId,
    aiId: aiExists.id,
  }).returning().get()
}
