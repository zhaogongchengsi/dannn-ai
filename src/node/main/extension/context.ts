import type { ClientOptions } from 'openai'
import type { CreateAIInput, Question } from '~/common/schema'
import { EventEmitter } from 'node:events'
import process from 'node:process'
import { question } from '~/common/schema'
import { AI } from './ai'
import { client, database } from './ipc'
import { QuestionEvent } from './question-event'

export interface ExtensionContextEvents {
  /**
   * Emitted when a new question is received that matches the AI instances registered.
   * @param question - The question data.
   */
  question: [QuestionEvent]
}

export class ExtensionContext extends EventEmitter<ExtensionContextEvents> {
  private readonly aiHub: Map<number, AI> = new Map()
  constructor() {
    super()
    
    client.onEvent('question', (data: Question) => {
      const { success, data: parsedData } = question.safeParse(data)
      if (!success) {
        console.error('Invalid question data received:', parsedData)
        return
      }
      if (parsedData.aiIds.some((id: number) => this.aiHub.has(id))) {
        this.emit('question', new QuestionEvent(parsedData))
      }
    })

    // rpc.on('extension.question', (preload: Question) => {
    //   const { success, data } = question.safeParse(preload)
    //   if (!success) {
    //     console.error('Invalid question data received:', data)
    //     return
    //   }
    //   if (data.aiIds.some((id: number) => this.aiHub.has(id))) {
    //     this.emit('question', new QuestionEvent(data))
    //   }
    // })
  }


  /**
   * Register a new AI instance with the provided configuration.
   * @param config - The configuration for the AI instance.
   * @param clientOpt - The client options for OpenAI.
   * @returns A new AI instance.
   */
  async registerAI(config: CreateAIInput, clientOpt: ClientOptions) {
    if (!process.env.DANNN_PROCESS_PATH) {
      throw new Error('DANNN_PROCESS_PATH environment variable is not set.')
    }

    const aiMeta = await database.ai.registerAi({
      ...config,
      createdBy: process.env.DANNN_PROCESS_PATH,
    })

    const ai = new AI(aiMeta, clientOpt)

    this.aiHub.set(aiMeta.id, ai)

    return ai
  }
}
