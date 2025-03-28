import type { AICollection } from './schemas/extension'
import { OpenAI } from 'openai'

export class AI {
  private openai: OpenAI
  name: string
  config: AICollection
  constructor(ai: AICollection) {
    if (!ai.name || !ai.apiKey || !ai.apiEndpoint) {
      throw new Error('API Key and Endpoint are required')
    }
    this.config = ai
    this.name = ai.name
    this.openai = new OpenAI({
      baseURL: ai.apiEndpoint,
      apiKey: ai.apiKey,
      dangerouslyAllowBrowser: true,
    })
  }

  async sendTextMessage(message: string, module: string = 'deepseek-chat') {
    const response = await this.openai.chat.completions.create({
      model: module,
      messages: [{ role: 'system', content: message }],
    })

    return response.choices[0].message.content
  }
}
