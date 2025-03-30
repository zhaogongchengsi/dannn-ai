import type { AIConfig } from '../schemas/ai'
import type { CreateAIOptions } from '../types/ai'
import { OpenAI } from 'openai'
import { InstallEvent } from '../common/install-event'

export class AI extends InstallEvent<AI> {
  config: AIConfig
  options: CreateAIOptions
  openai?: OpenAI | null = null
  isLoaded = false
  constructor(config: AIConfig, options: CreateAIOptions = { laze: true }) {
    super()
    this.config = config
    this.options = options
    if (!this.options.laze) {
      this.init()
    }
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
}
