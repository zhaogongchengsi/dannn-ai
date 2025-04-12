import { Subject } from 'rxjs'
import { AiEvent } from '../common/event'
import type { CreateAIInput } from '../common/schema'
import { createAIInput } from '../common/schema'
import { BaseClient } from './client'

const client = BaseClient.getInstance()

const aiCreated$ = new Subject<CreateAIInput>()

client.socket.on(AiEvent.create, (ai: CreateAIInput) => {
	aiCreated$.next(ai)
})

export async function registerAI(config: CreateAIInput) {
	const { success, data, error } = createAIInput.safeParse(config)

	if (!success) {
		throw new Error(`Invalid AI config: ${error}`)
	}

	const newAI = await client.trpc.ai.createAi.mutate(data)

	client.socket.emit(AiEvent.create, newAI)
}

export function onAIRegistered(callback: (ai: CreateAIInput) => void) {
	const subscription = aiCreated$.subscribe(callback)
	return () => subscription.unsubscribe()
}