import type { InfoMessage } from './message'
import type { AIData, MakeFieldsOptional, RoomData } from '~/common/types'
import { eq } from 'drizzle-orm'
import lodash from 'lodash'
import { router } from '~/common/router'
import { db } from '../db'
import { ais, chatParticipants, messages, rooms } from '../schema'
import { getAiMessagesByCount } from './message'

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
      ais,
    })
    .from(chatParticipants)
    .leftJoin(ais, eq(chatParticipants.aiId, ais.id))
    .where(eq(chatParticipants.roomId, roomId))
    .all()

  return lodash.compact(participants.map(({ ais }) => ais))
}

export async function getRoomMessages(roomId: number) {
  const messageList = await db
    .select()
    .from(messages) // Assuming 'messages' is the table name for storing messages
    .where(eq(messages.roomId, roomId))
    .orderBy(messages.sortBy)
    .all()

  return messageList
}

export async function getAllRooms(): Promise<RoomData[]> {
  const roomsList = await db
    .select()
    .from(rooms)
    .all()

  const groupedRooms = await Promise.all(
    roomsList.map(async (room) => {
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

export async function getRoomContextMessages(roomId: number): Promise<InfoMessage[]> {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error(`Room with id ${roomId} does not exist`)
  }

  return getAiMessagesByCount(roomId, room.maxContextMessages)
}

export const room = router({
  getAllRooms,
  insertRoom,
  getRoomParticipants,
  getRoomMessages,
  getRoomById,
  updateRoomById,
  deleteRoomById,
  addAiToRoom,
  getRoomContextMessages,
})
