import type OpenAI from 'openai'
import type { Answer, Question } from '~/common/schema'
import type { MessageStatus } from '~/node/database/service/message'
import { database, rpc } from './ipc'

export class QuestionEvent {
  question: Question
  aiId?: number
  _thinking = false
  constructor(question: Question) {
    this.question = question
  }

  get content() {
    return this.question.content
  }

  get type() {
    return this.question.type
  }

  get roomId() {
    return this.question.roomId
  }

  get reference() {
    return this.question.reference
  }

  get aiIds() {
    return this.question.aiIds
  }

  get context(): OpenAI.ChatCompletionMessageParam[] {
    return this.question.context.map((item): OpenAI.ChatCompletionMessageParam => {
      const parma: OpenAI.ChatCompletionMessageParam = {
        role: item.role,
        content: item.content,
      }
      return parma
    })
  }

  async #sendTextAnswer(answer: Answer) {
    const answerMessage = await database.message.createAiAnswer(answer)
    rpc.emit('window.answer', answerMessage)
    return answerMessage
  }

  async #updateMessageStatus(messageId: string, status: MessageStatus) {
    database.message.updateMessageStatus(messageId, status)
    rpc.emit('window.answer-status-update', {
      messageId,
      status,
    })
  }

  async thinking(aiId: number) {
    this._thinking = true
    this.aiId = aiId
    rpc.emit('window.ai-thinking', {
      roomId: this.question.roomId,
      aiId,
      questionId: this.question.id,
    })
  }

  async endThink(aiId: number) {
    if (this._thinking) {
      rpc.emit('window.ai-endThink', {
        roomId: this.question.roomId,
        aiId,
        questionId: this.question.id,
      })
      this._thinking = false
    }
  }

  sendOpenAiStream(contentStream: AsyncIterable<OpenAI.ChatCompletionChunk>, aiId: number) {
    const roomId = this.question.roomId
    const streamGroupId = `${this.question.roomId}-${this.question.id}`
    this.endThink(aiId)

    return new Promise<void>((resolve, reject) => {
      if (!contentStream) {
        reject(new Error('Stream content cannot be empty'))
      }
      ; (async () => {
        let index = 0
        let messageId: string = ''
        for await (const chunk of contentStream) {
          const content = chunk.choices?.[0]?.delta?.content
          if (!content) {
            continue // Skip empty chunks
          }
          try {
            const message = await this.#sendTextAnswer({
              content,
              roomId,
              type: 'text',
              aiId,
              isStreaming: true,
              streamGroupId,
              streamIndex: index++,
            })

            messageId = message.id

            if (index === 0) {
              await this.#updateMessageStatus(messageId, 'pending')
            }
          }
          catch (innerErr) {
            console.error('Failed to send one chunk:', innerErr)
            // 如果需要终止也可以直接 throw
          }
        }

        await this.#updateMessageStatus(messageId, 'success')
      })().then(resolve).catch(reject)
    })
  }
}
