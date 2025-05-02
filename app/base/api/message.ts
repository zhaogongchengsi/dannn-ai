import type { Answer, Question } from 'common/schema'
import type { InfoMessage } from 'common/types'
import { ChannelEvent } from 'common/event'
import { filter, Subject } from 'rxjs'
import { BaseClient } from './client'

export interface UserMessageData {
  /**
   * 发送问题的内容
   */
  content: string
  /**
   * 发送问题的房间id
   */
  roomId: string
  /**
   * 当发送的问题附带了引用时，引用的消息id
   */
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
const answerMessageSubject$ = new Subject<InfoMessage>()
const client = BaseClient.getInstance()

client.socket.on(ChannelEvent.question, (message: QuestionMessageMeta) => {
  questionMessageSubject$.next(message)
})

client.socket.on(ChannelEvent.answer, (message: QuestionMessageMeta) => {
  answerMessageSubject$.next(message)
})

export async function sendQuestion(message: Question) {
  const questionMessage: InfoMessage = await client.trpc.message.createQuestion.mutate(message)
  client.socket.emit(ChannelEvent.question, {
    ...questionMessage,
    roomParticipants: message.roomParticipants,
  })
}

export async function onQuestionWithAiId(aiId: number, callback: (message: QuestionMessageMeta) => void) {
  const subscription = questionMessageSubject$.pipe(filter(message => message.roomParticipants.includes(aiId))).subscribe(callback)
  return () => subscription.unsubscribe()
}

export function onAnswerWithAiId(roomId: number, callback: (message: InfoMessage) => void) {
  const subscription = answerMessageSubject$.pipe(filter(message => message.roomId === roomId)).subscribe(callback)
  return () => subscription.unsubscribe()
}

export function onAnswerMessage(callback: (message: InfoMessage) => void) {
  const subscription = answerMessageSubject$.subscribe(callback)
  return () => subscription.unsubscribe()
}

export async function sendTextAnswer(answer: Answer) {
  const answerMessage: InfoMessage = await client.trpc.message.createAiAnswer.mutate(answer)
  client.socket.emit(ChannelEvent.answer, answerMessage)
}
