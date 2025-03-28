import { AI } from '@/lib/ai'
import { Plugin } from 'vue'

export const AI_PROVIDE_KEY = Symbol('AI')

export interface AIPluginProvide {
	getAI(name: string): AI
	getAISafe(name: string): AI | undefined
	createAI(ai: AI): void
}

export function AIPlugin(): Plugin {
	const aiPool = new Map<string, AI>()
	return {
		install(app) {
			function getAI(name: string) {
				if (!aiPool.has(name)) {
					throw new Error(`AI ${name} not found`)
				}
				return aiPool.get(name)!
			}

			function getAISafe(name: string) {
				return aiPool.get(name)
			}

			function createAI(ai: AI) {
				aiPool.set(ai.name, ai)
			}

			const provide: AIPluginProvide = {
				getAI,
				getAISafe,
				createAI
			}

			app.provide(AI_PROVIDE_KEY, provide)
		}
	}
}