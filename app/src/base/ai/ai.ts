import type { AIConfig } from '../schemas/ai'
import type { CreateAIOptions } from '../types/ai'
import { OpenAI } from 'openai'
import { InstallEvent } from '../common/install-event'
import type { Stream } from 'openai/streaming.mjs'

export class AI extends InstallEvent<AI> {
  config: AIConfig
  options: CreateAIOptions
  openai?: OpenAI | null = null
  isLoaded = false
  name: string
  constructor(config: AIConfig, options: CreateAIOptions = { laze: true }) {
    super()

    if (config.models.length === 0) {
      throw new Error('No models provided')
    }

    if (!config.apiKey) {
      throw new Error('No API key provided')
    }

    if (!config.apiBaseurl) {
      throw new Error('No API base URL provided')
    }

    this.config = config
    this.name = config.name
    this.options = options
    if (!this.options.laze) {
      this.init()
    }
  }

  getModules() {
    return this.config.models
  }

  init() {
    this.emit('status-changed', 'loading')
    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.apiBaseurl,
      timeout: 10000,
      dangerouslyAllowBrowser: true,
    })
    this.emit('status-changed', 'ready')
    this.emit('loaded', this)
    this.isLoaded = true
  }

  getOpenAI() {
    if (this.openai) {
      return this.openai
    }
    this.init()
    return this.openai!
  }

  async chat(prompt: string, options?: OpenAI.ChatCompletionCreateParamsNonStreaming) {
    const openai = this.getOpenAI()
    if (!openai) {
      throw new Error('OpenAI not initialized')
    }

    options = Object.assign({
      messages: [{ role: 'user', content: prompt }],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      stream: true,
      model: this.config.models[0],
    }, options)

    return await openai.chat.completions.create(options) as unknown as Stream<OpenAI.ChatCompletionChunk>
  }
}
