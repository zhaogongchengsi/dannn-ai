import type { ClientOptions } from 'openai'
import type { CreateAIInput } from '~/common/schema'
import { EventEmitter } from 'node:events'
import process from 'node:process'
import OpenAI from 'openai'
import { AI } from './ai'
import { database } from './ipc'

export interface ExtensionContextEvents {
  question: [string, any]
}

export class ExtensionContext extends EventEmitter<ExtensionContextEvents> {
  OpenAI: typeof OpenAI = OpenAI
  constructor() {
    super()
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
    return new AI(aiMeta, clientOpt)
  }
}
