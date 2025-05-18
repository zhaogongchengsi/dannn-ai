import type { Answer, Question } from 'common/schema'
import { randomUUID } from 'node:crypto'
import { and, count, desc, eq } from 'drizzle-orm'
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
      messageType: question.type,
      sortBy: newLastMessage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      roomId: question.roomId,
      reference: question.reference || null,
      senderType: 'human',
      senderId: 0,
      parentId: null,
      status: null,
      meta: null,
      isAIAutoChat: 0,
      isStreaming: 0,
      streamGroupId: null,
      streamIndex: null,
      functionCall: null,
      functionResponse: null,
      isInContext: 0,
    }

    return await tx.insert(messages).values(message).returning().get()
  })
}

export async function createAiAnswer(answer: Answer): Promise<InfoMessage> {
  return db.transaction(async (tx) => {
    // 如果为流式消息，检查是否已经存在相同的 streamGroupId 的消息
    // 如果存在，则更新内容并返回更新后的消息 防止消息碎片过多
    if (answer.isStreaming && answer.streamGroupId) {
      const existingMessage = await tx
        .select()
        .from(messages)
        .where(eq(messages.streamGroupId, answer.streamGroupId))
        .get()

      if (existingMessage) {
        const updatedContent = existingMessage.content + answer.content
        await tx
          .update(messages)
          .set({ content: updatedContent, updatedAt: new Date().toISOString() })
          .where(eq(messages.id, existingMessage.id))
        return { ...existingMessage, content: updatedContent }
      }
    }

    const lastMessage = await tx
      .select({
        lastMessage: rooms.lastMessage,
      })
      .from(rooms)
      .where(eq(rooms.id, answer.roomId))
      .get()

    if (!lastMessage) {
      throw new Error(`Room with ID ${answer.roomId} not found`)
    }

    const newLastMessage = Number(lastMessage.lastMessage) + 1

    await tx.update(rooms).set({ lastMessage: newLastMessage }).where(eq(rooms.id, answer.roomId))

    const message: InfoMessage = {
      id: randomUUID(),
      content: answer.content,
      messageType: answer.type,
      sortBy: newLastMessage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      roomId: answer.roomId,
      reference: answer.reference || null,
      senderType: 'ai',
      senderId: answer.aiId,
      parentId: null,
      status: null,
      meta: null,
      isAIAutoChat: 0,
      isStreaming: answer.isStreaming ? 1 : 0,
      streamGroupId: answer.streamGroupId || null,
      streamIndex: answer.streamIndex || null,
      functionCall: null,
      functionResponse: null,
      isInContext: 0,
    }

    return await tx.insert(messages).values(message).returning().get()
  })
}

export async function getMessagesByPage(
  roomId: number,
  page: number,
  pageSize: number = 20,
): Promise<{ data: InfoMessage[], total: number }> {
  const offset = (page - 1) * pageSize

  const [messagesData, totalCount] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .orderBy(messages.sortBy)
      .limit(pageSize)
      .offset(offset)
      .all(),
    db
      .select({ count: count(messages.id) })
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .get(),
  ])

  return {
    data: messagesData,
    total: !totalCount ? 0 : Number(totalCount.count),
  }
}

export async function getMessagesByPageDesc(
  roomId: number,
  page: number,
  pageSize: number = 20,
): Promise<{ data: InfoMessage[], total: number }> {
  const offset = (page - 1) * pageSize

  const [messagesData, totalCount] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .orderBy(desc(messages.sortBy))
      .limit(pageSize)
      .offset(offset)
      .all(),
    db
      .select({ count: count(messages.id) })
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .get(),
  ])

  return {
    data: messagesData,
    total: !totalCount ? 0 : Number(totalCount.count),
  }
}

export async function clearAllMessages(): Promise<void> {
  await db.delete(messages).execute()
}

export async function getAiMessagesByCount(
  roomId: number,
  countNum: number,
  direction: 'asc' | 'desc' = 'desc',
): Promise<InfoMessage[]> {
  const order = direction === 'asc' ? messages.sortBy : desc(messages.sortBy)
  return await db
    .select()
    .from(messages)
    .orderBy(order)
    .where(and(eq(messages.roomId, roomId), eq(messages.isInContext, 1)))
    .limit(countNum)
    .all()
}

export async function updateAIMessageContextTrue(
  messageId: string,
): Promise<InfoMessage> {
  const updatedMessages = await db
    .update(messages)
    .set({ isInContext: 1, updatedAt: new Date().toISOString() })
    .where(eq(messages.id, messageId))
    .returning()
    .get()

  return updatedMessages
}

export async function updateAIMessageContextFalse(
  messageId: string,
): Promise<InfoMessage> {
  const updatedMessages = await db
    .update(messages)
    .set({ isInContext: 0, updatedAt: new Date().toISOString() })
    .where(eq(messages.id, messageId))
    .returning()
    .get()

  return updatedMessages
}
