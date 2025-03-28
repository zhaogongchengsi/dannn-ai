import { OpenAI } from 'openai'
import { AIConfig } from '../schemas/ai'
import { Subject } from 'rxjs/internal/Subject'

class AIHub extends Subject<any> {
  aiPool: Map<string, OpenAI> = new Map()

  constructor() {
    super()
  }

  createAI(ai: AIConfig) {
    if (!ai.name || !ai.apiKey || !ai.apiBaseurl) {
      throw new Error('AI name, apiKey, apiBaseurl are required')
    }

    const openAi = new OpenAI({
      baseURL: ai.apiBaseurl,
      apiKey: ai.apiKey,
      dangerouslyAllowBrowser: true,
    })

    this.aiPool.set(ai.name, openAi)

    this.next({name: ai.name, openAi})
  }

  async sendTextMessage(message: string, module: string = 'deepseek-chat') {
    const response = await this.openai.chat.completions.create({
      model: module,
      messages: [{ role: 'system', content: message }],
    })

    return response.choices[0].message.content
  }
}

export const aihub = new AIHub()