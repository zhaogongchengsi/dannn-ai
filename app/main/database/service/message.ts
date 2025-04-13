import { Question } from "common/schema"; 
import { db } from '../db'
import { messages, rooms } from "../schema";
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'

export type InfoMessage = typeof messages.$inferSelect

export async function getLastMessageForRoom(roomId: number): Promise<number | null> {
	const lastMessage = await db
		.select({
			lastMessage: rooms.lastMessage
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
	const lastMessage = await getLastMessageForRoom(question.roomId)

	if (!lastMessage) {
		throw new Error(`Room with ID ${question.roomId} not found lastMessage`)
	}

	const message: InfoMessage = {
		id: randomUUID(),
		content: question.content,
		messageType: question.messageType,
		sortBy: lastMessage + 1,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
		roomId: question.roomId,
		reference: question.reference || null,
		senderType: "human",
		senderId: "local",
		parentId: null,
		status: null,
		meta: null,
		isAIAutoChat: 0,
		isStreaming: 0,
		streamGroupId: null,
		streamIndex: null,
		functionCall: null,
		functionResponse: null
	}

	return await db.insert(messages).values(message).returning().get()
}
