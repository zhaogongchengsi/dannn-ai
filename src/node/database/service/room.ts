import type { InfoAI } from './ai'
import type { InfoMessage } from './message'
import type { MakeFieldsOptional } from '~/common/types'
import { eq } from 'drizzle-orm'
import lodash from 'lodash'
import { router } from '~/common/router'
import { db } from '../db'
import { ais, chatParticipants, messages, rooms } from '../schema'
import { getAiMessagesByCount } from './message'

export type InfoRoom = typeof rooms.$inferSelect
export type InsertChat = Pick<InfoRoom, 'title' | 'avatar' | 'description' | 'prompt'>
export type InfoChat = InfoRoom & {
  participant: InfoAI[]
}

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

export async function getRoomParticipants(roomId: number): Promise<InfoAI[]> {
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

export async function getAllRooms(): Promise<InfoChat[]> {
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

export async function getRoomById(id: number): Promise<InfoChat | undefined> {
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

export async function roomExists(roomId: number): Promise<boolean> {
  const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get()
  return !!room
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

/**
 *
 * @param roomId 房间id
 * @description memoryInterval 调用一次会 MemoryInterval 会减少 1, 当为 零 时表示次数到了 需要将提示词加入上下文 然后将 memoryInterval 重置为初始值
 * @returns boolean 是否需要将提示词加入上下文
 */
export async function updateRoomMemoryInterval(roomId: number) {
  return db.transaction(async (ctx): Promise<boolean> => {
    const findRoom = async () => await ctx.select().from(rooms).where(eq(rooms.id, roomId)).get()
    const room = await findRoom()

    if (!room) {
      throw new Error(`Room with id ${roomId} does not exist`)
    }

    if (room.memoryInterval === 1) {
      // 重置 memoryInterval
      await ctx
        .update(rooms)
        .set({
          memoryInterval: room.memoryIntervalInitialValue || 15, // 重置为最大上下文消息数
        })
        .where(eq(rooms.id, roomId))

      return true // 需要将提示词加入上下文
    }

    // 减少 memoryInterval
    await ctx
      .update(rooms)
      .set({
        memoryInterval: room.memoryInterval - 1,
      })
      .where(eq(rooms.id, roomId))

    return false // 不需要将提示词加入上下文
  })
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
  updateRoomMemoryInterval,
})
