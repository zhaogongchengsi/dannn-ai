import type { AIMessage } from './models'
import { findLastMessageSortId, updateLastMessageSortId } from './chatService'
import { database } from './database'

export async function createQuestionMessage(
  question: string,
  chatId: string,
): Promise<AIMessage> {
  return await database.transaction('rw', [database.aiMessages, database.aiChats], async () => {
    const lastSortId = await findLastMessageSortId(chatId)
    const sortId = lastSortId + 1

    const message: AIMessage = {
      id: crypto.randomUUID(),
      chatId,
      content: question,
      timestamp: Date.now(),
      senderIsUser: true,
      sortId,
      senderId: '',
    }

    await updateLastMessageSortId(chatId, sortId)

    await database.aiMessages.add(message)

    return message
  })
}

export async function createAnswerMessage(
  answer: string,
  chatId: string,
  senderId: string,
): Promise<AIMessage> {
  return await database.transaction('rw', [database.aiMessages, database.aiChats], async () => {
    const lastSortId = await findLastMessageSortId(chatId)
    const sortId = lastSortId + 1

    const message: AIMessage = {
      id: crypto.randomUUID(),
      chatId,
      content: answer,
      timestamp: Date.now(),
      senderIsAI: true,
      sortId,
      senderId,
    }

    await updateLastMessageSortId(chatId, sortId)

    await database.aiMessages.add(message)

    return message
  })
}
