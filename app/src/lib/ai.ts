import type { AICollection } from './schema'
import { OpenAI } from 'openai'

export class AI {
  private openai: OpenAI
  name: string
  constructor(ai: AICollection) {
    if (!ai.name || !ai.apiKey || !ai.apiEndpoint) {
	  throw new Error('API Key and Endpoint are required')
	}
	this.name = ai.name
    this.openai = new OpenAI({
		baseURL: ai.apiEndpoint,
		apiKey: ai.apiKey
	})
  }
}
