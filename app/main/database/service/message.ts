import type { Question } from 'common/schema'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { messages, rooms } from '../schema'

export type InfoMessage = typeof messages.$inferSelect

export async function getLastMessageForRoom(roomId: number): Promise<number | null> {
  const lastMessage = await db
    .select({
      lastMessage: rooms.lastMessage,
    })
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .get()

  if (!lastMessage) {
    return null
  }

  return Number(lastMessage.lastMessage)
}

export async function createQuestion(question: Question): Promise<InfoMessage> {
  return db.transaction(async (tx) => {
    const lastMessage = await tx
      .select({
        lastMessage: rooms.lastMessage,
      })
      .from(rooms)
      .where(eq(rooms.id, question.roomId))
      .get()

    if (!lastMessage) {
      throw new Error(`Room with ID ${question.roomId} not found`)
    }

    const newLastMessage = Number(lastMessage.lastMessage) + 1

    await tx.update(rooms).set({ lastMessage: newLastMessage }).where(eq(rooms.id, question.roomId))

    const message: InfoMessage = {
      id: randomUUID(),
      content: question.content,
      messageType: question.messageType,
      sortBy: newLastMessage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      roomId: question.roomId,
      reference: question.reference || null,
      senderType: 'human',
      senderId: 'local',
      parentId: null,
      status: null,
      meta: null,
      isAIAutoChat: 0,
      isStreaming: 0,
      streamGroupId: null,
      streamIndex: null,
      functionCall: null,
      functionResponse: null,
    }

    return await tx.insert(messages).values(message).returning().get()
  })
}
