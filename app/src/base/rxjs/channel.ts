import type { AnswerMessage, QuestionMessage } from '@dannn/schemas'
import { Subject } from 'rxjs'

// 定义流
export const questionToWorker$ = new Subject<QuestionMessage>() // 发送到 Worker 的问题流
export const answerFromWorker$ = new Subject<AnswerMessage>() // 从 Worker 接收的回答流

// 订阅函数
export function subscribeToWorkerQuestions(callback: (message: QuestionMessage) => void): () => void {
  const subscription = questionToWorker$.subscribe(callback)
  return () => subscription.unsubscribe()
}

export function subscribeToWorkerAnswers(callback: (message: AnswerMessage) => void): () => void {
  const subscription = answerFromWorker$.subscribe(callback)
  return () => subscription.unsubscribe()
}

// 发送函数
export function sendQuestionToWorker(message: QuestionMessage): void {
  questionToWorker$.next(message)
}

export function sendAnswerFromWorker(message: AnswerMessage): void {
  answerFromWorker$.next(message)
}
