import type { AnswerMessage, QuestionMessage } from '@dannn/schemas'
import { Subject } from 'rxjs'

export const toWorkerChannel = new Subject<QuestionMessage>()
export const formWorkerChannel = new Subject<AnswerMessage>()

export function onToWorkerChannel(
  callback: (message: QuestionMessage) => void,
): () => void {
  const subscription = toWorkerChannel.subscribe(callback)
  return () => subscription.unsubscribe()
}

export function onFormWorkerChannel(
  callback: (message: AnswerMessage) => void,
): () => void {
  const subscription = formWorkerChannel.subscribe(callback)
  return () => subscription.unsubscribe()
}

export function sendToWorkerChannel(message: QuestionMessage): void {
  toWorkerChannel.next(message)
}

export function sendFormWorkerChannel(message: AnswerMessage): void {
  formWorkerChannel.next(message)
}
