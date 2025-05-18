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
  roomId: number
}

const questionMessageSubject$ = new Subject<QuestionMessageMeta>()
const answerMessageSubject$ = new Subject<InfoMessage>()
const allMessagesSubject$ = new Subject<InfoMessage>()
const client = BaseClient.getInstance()

client.socket.on(ChannelEvent.question, (message: QuestionMessageMeta) => {
  allMessagesSubject$.next(message)
  questionMessageSubject$.next(message)
})

client.socket.on(ChannelEvent.answer, (message: InfoMessage) => {
  allMessagesSubject$.next(message)
  answerMessageSubject$.next(message)
})

client.socket.on(ChannelEvent.all, (message: InfoMessage) => {
  allMessagesSubject$.next(message)
})

/**
 * 异步函数，用于发送问题消息。
 *
 * @param message - 包含问题内容的 `Question` 对象。
 * @returns 一个 Promise，表示问题消息的创建和发送过程。
 *
 * 此函数会执行以下操作：
 * 1. 调用 `client.trpc.message.createQuestion.mutate` 方法创建问题消息。
 * 2. 使用 `client.socket.emit` 方法通过指定的频道事件发送问题消息。
 */
export async function sendQuestion(message: Question) {
  const questionMessage: InfoMessage = await client.trpc.message.createQuestion.mutate(message)
  client.socket.emit(ChannelEvent.question, {
    ...questionMessage,
    roomParticipants: message.roomParticipants,
    roomId: message.roomId,
  })
  client.socket.emit(ChannelEvent.all, questionMessage)
  allMessagesSubject$.next(questionMessage)
}

/**
 * 异步函数，用于发送文本回答。
 *
 * @param answer - 包含回答内容的 `Answer` 对象。
 * @returns 一个 Promise，表示回答消息的创建和发送过程。
 *
 * 此函数会执行以下操作：
 * 1. 调用 `client.trpc.message.createAiAnswer.mutate` 方法创建 AI 回答消息。
 * 2. 使用 `client.socket.emit` 方法通过指定的频道事件发送回答消息。
 */
export async function sendTextAnswer(answer: Answer) {
  const answerMessage: InfoMessage = await client.trpc.message.createAiAnswer.mutate(answer)
  client.socket.emit(ChannelEvent.answer, answerMessage)
  client.socket.emit(ChannelEvent.all, answerMessage)
  allMessagesSubject$.next(answerMessage)
}

/**
 * 监听指定 AI ID 的问题消息。
 *
 * @param aiId - AI 的唯一标识符。
 * @param callback - 当接收到包含指定 AI ID 的问题消息时调用的回调函数。
 * @returns 一个函数，用于取消订阅监听。
 *
 * @remarks
 * 该函数会订阅 `questionMessageSubject$`，并过滤出 `roomParticipants` 中包含指定 AI ID 的消息。
 * 当符合条件的消息到达时，会调用提供的回调函数。
 */
export async function onQuestionWithAiId(aiId: number, callback: (message: QuestionMessageMeta) => void) {
  const subscription = questionMessageSubject$.pipe(filter(message => message.roomParticipants.includes(aiId))).subscribe(callback)
  return () => subscription.unsubscribe()
}

/**
 * 监听指定房间 ID 的回答消息。
 *
 * @param roomId - 房间的唯一标识符。
 * @param callback - 当接收到属于指定房间的回答消息时调用的回调函数。
 * @returns 一个函数，用于取消订阅监听。
 *
 * @remarks
 * 该函数会订阅 `answerMessageSubject$`，并过滤出 `roomId` 等于指定值的消息。
 * 当符合条件的消息到达时，会调用提供的回调函数。
 */
export function onAnswerWithRoomId(roomId: number, callback: (message: InfoMessage) => void) {
  const subscription = answerMessageSubject$.pipe(filter(message => message.roomId === roomId)).subscribe(callback)
  return () => subscription.unsubscribe()
}

/**
 * 监听所有回答消息。
 *
 * @param callback - 当接收到回答消息时调用的回调函数。
 * @returns 一个函数，用于取消订阅监听。
 *
 * @remarks
 * 该函数会订阅 `answerMessageSubject$`，并在有新回答消息时调用提供的回调函数。
 */
export function onAnswerMessage(callback: (message: InfoMessage) => void) {
  const subscription = answerMessageSubject$.subscribe(callback)
  return () => subscription.unsubscribe()
}

/**
 * 异步函数，用于分页获取指定房间的消息。
 *
 * @param roomId - 房间的唯一标识符。
 * @param page - 当前页码，从 1 开始。
 * @param pageSize - 每页包含的消息数量。
 * @returns 一个 Promise，包含消息数据和总消息数量。
 *
 * 此函数会调用 `client.trpc.message.getMessageByPage.query` 方法，
 * 根据提供的房间 ID、页码和每页大小获取对应的消息数据。
 */
export async function getMessagesByPage(roomId: number, page: number, pageSize: number): Promise<{
  data: InfoMessage[]
  total: number
}> {
  return await client.trpc.message.getMessageByPage.query({
    roomId,
    page,
    pageSize,
  })
}

/**
 * 订阅所有消息的回调函数。
 *
 * @param callback - 一个回调函数，当有新的消息时会被调用。
 *                   该函数接收一个 `InfoMessage` 类型的参数，表示接收到的消息。
 * @returns 一个函数，用于取消订阅消息。
 */
export function onAllMessages(callback: (message: InfoMessage) => void) {
  const subscription = allMessagesSubject$.subscribe(callback)
  return () => subscription.unsubscribe()
}
