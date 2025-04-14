import type { Question } from 'common/schema'
import type { InfoMessage } from 'common/types'
import { ChannelEvent } from 'common/event'
import { filter, Subject } from 'rxjs'
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

export type QuestionMessageMeta = InfoMessage & {
  roomParticipants: number[]
}

const questionMessageSubject$ = new Subject<QuestionMessageMeta>()
const client = BaseClient.getInstance()

client.socket.on(ChannelEvent.question, (message: QuestionMessageMeta) => {
  questionMessageSubject$.next(message)
})

export async function sendQuestion(message: Question) {
  const questionMessage: InfoMessage = await client.trpc.message.createQuestion.mutate(message)
  client.socket.emit(ChannelEvent.question, {
    ...questionMessage,
    roomParticipants: message.roomParticipants,
  })
}

export async function onQuestionWithAiId(aiId: number, callback: (message: QuestionMessageMeta) => void) {
  questionMessageSubject$.pipe(filter(message => message.roomParticipants.includes(aiId))).subscribe(callback)
}

export function sendAnswer() {}
