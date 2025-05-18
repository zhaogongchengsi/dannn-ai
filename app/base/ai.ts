import type { AIData, InfoMessage, RoomData } from 'common/types'
import type { OpenAI } from 'openai'
import type { QuestionMessageMeta } from './api/message'
import { omit } from 'lodash'
import { Subject } from 'rxjs'
import { onQuestionWithAiId, sendTextAnswer } from './api/message'
import { getRoomContextMessages, getRoomById, thinking, endThink } from './api/room'

export type UserMessage = Omit<QuestionMessageMeta, 'roomParticipants'>

export interface ContextMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export class AI {
  private readonly _config: AIData
  private readonly subject = new Subject<QuestionEvent>()
  private maxContextMessages: number
  private maxContextMessagesInitialized = false // 新增标志

  constructor(config: AIData) {
    this._config = config
    this.maxContextMessages = 0
    this.bindEvents()
  }

  private bindEvents() {
    onQuestionWithAiId(this.id, async (message) => {
      const userMessage = omit(message, ['roomParticipants'])
      const ctxMessages = await getRoomContextMessages(message.roomId)
      const room = (await getRoomById(message.roomId))!
      if (!this.maxContextMessagesInitialized) {
        this.maxContextMessages = room.maxContextMessages || 5
        this.maxContextMessagesInitialized = true
      }
      room.maxContextMessages = this.maxContextMessages
      this.subject.next(new QuestionEvent(this, room, userMessage, ctxMessages))
    })
  }

  setMaxContextMessages(maxContextMessages: number) {
    this.maxContextMessages = maxContextMessages
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
  _room: RoomData
  question: UserMessage
  ctxMessages: InfoMessage[]
  _maxContextMessages: number
  _thinking: boolean = false

  constructor(
    ai: AI,
    room: RoomData,
    question: UserMessage,
    ctxMessages: InfoMessage[] = [],
  ) {
    this.ai = ai
    this._room = room
    this._maxContextMessages = room.maxContextMessages
    this.question = question
    this.ctxMessages = ctxMessages
  }

  thinking () {
    console.log('thinking', this.question.roomId, this.ai.id)
    thinking(this.question.roomId, this.ai.id)
    this._thinking = true
  }

  endThink () {
    if (this._thinking) {
      console.log('endThink', this.question.roomId, this.ai.id)
      endThink(this.question.roomId, this.ai.id)
      this._thinking = false
    }
  }

  async reply(content: string) {
    if (!content) {
      throw new Error('Reply content cannot be empty')
    }
    this.endThink()
    await sendTextAnswer({
      content,
      roomId: this.question.roomId,
      type: 'text',
      aiId: this.ai.id,
    })
    .finally(() => {
      this._maxContextMessages--
    })
  }

  async sendOpenAIStream(contentStream: AsyncIterable<OpenAI.ChatCompletionChunk>) {
    const roomId = this.question.roomId
    const aiId = this.ai.id
    const streamGroupId = `${this.question.roomId}-${this.question.id}`
    this.endThink();

    return new Promise<void>((resolve, reject) => {
      if (!contentStream) {
        reject(new Error('Stream content cannot be empty'))
      }  
      ; (async () => {
        let index = 0
        for await (const chunk of contentStream) {
          const content = chunk.choices?.[0]?.delta?.content
          if (!content) {
            continue // Skip empty chunks
          }
          await sendTextAnswer({
            content,
            roomId,
            type: 'text',
            aiId,
            isStreaming: true,
            streamGroupId,
            streamIndex: index++,
          })
        }
      })().then(resolve).catch(reject)
        .finally(() => {
          this._maxContextMessages--
        })
    })
  }

  sendStream(contentStream: AsyncIterable<string>) {
    const roomId = this.question.roomId
    const aiId = this.ai.id
    const streamGroupId = `${this.question.roomId}-${this.question.id}`
    this.endThink();

    return new Promise<void>((resolve, reject) => {
      if (!contentStream) {
        reject(new Error('Stream content cannot be empty'))
      }
      ; (async () => {
        let index = 0
        for await (const content of contentStream) {
          if (!content) {
            throw new Error('Stream content cannot be empty')
          }
          await sendTextAnswer({
            content,
            roomId,
            type: 'text',
            aiId,
            isStreaming: true,
            streamGroupId,
            streamIndex: index++,
          })
        }
      })().then(resolve).catch(reject)
    })
  }

  get content() {
    return this.question.content
  }

  get room() {
    return this._room
  }

  get maxContextMessages() {
    return this._maxContextMessages
  }

  get contextMessage(): ContextMessage[] {
    const list = this.ctxMessages.map((message) => ({
      role: message.senderType === 'ai' ? 'assistant' : 'user',
      content: message.content,
    } as ContextMessage))
    return list
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
