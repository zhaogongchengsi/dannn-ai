import type { Question } from 'common/schema'
import type { InfoMessage } from 'common/types'
import { ChannelEvent } from 'common/event'
import { Subject } from 'rxjs'
import { BaseClient } from './client'

export interface UserMessageData {
  content: string
  roomId: string
  reference: string | null
}

export interface AiMessageData {
  content: string
  roomId: string
  reference: string | null
  aiId: number | null
}

const messageSubject$ = new Subject<InfoMessage>()
const client = BaseClient.getInstance()

export async function sendQuestion(message: Question) {
  const questionMessage = await client.trpc.message.createQuestion.mutate(message)
  client.socket.emit(ChannelEvent.question, questionMessage)
  messageSubject$.next(questionMessage)
}

export function sendAnswer() {}
