import type { AIData } from 'common/types'
import type { QuestionMessageMeta } from './api/message'
import { omit } from 'lodash'
import { Subject } from 'rxjs'
import { onQuestionWithAiId } from './api/message'

export type UserMessage = Omit<QuestionMessageMeta, 'roomParticipants'>

export class AI {
  private readonly _config: AIData
  private readonly subject = new Subject<QuestionEvent>()

  constructor(config: AIData) {
    this._config = config
    this.bindEvents()
  }

  private bindEvents() {
    onQuestionWithAiId(this.id, (message) => {
      const userMessage = omit(message, ['roomParticipants'])
      this.subject.next(new QuestionEvent(this, userMessage))
    })
  }

  onQuestion(callback: (message: QuestionEvent) => void) {
    const unsubscribe = this.subject.subscribe(callback)
    return () => unsubscribe.unsubscribe()
  }

  get config() {
    return this._config
  }

  get id() {
    return this._config.id
  }

  get name() {
    return this._config.name
  }
}

class QuestionEvent {
  ai: AI
  question: UserMessage
  constructor(
    ai: AI,
    question: UserMessage,
  ) {
    this.ai = ai
    this.question = question
  }

  reply(content: string) {
    return {
      aiId: this.ai.id,
      content,
      roomId: this.question.roomId,
      createdAt: new Date().toISOString(),
    }
  }

  get content() {
    return this.question.content
  }

  get roomId() {
    return this.question.roomId
  }

  get reference() {
    return this.question.reference
  }

  get createdAt() {
    return this.question.createdAt
  }

  get id() {
    return this.question.id
  }

  get messageType() {
    return this.question.messageType
  }

  get status() {
    return this.question.status
  }
}
