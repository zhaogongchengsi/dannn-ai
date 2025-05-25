import type { CreateAIInput } from '~/common/schema'
import type { AIData } from '~/common/types'
import { Subject } from 'rxjs'
import { AiEvent } from '~/common/event'
import { createAIInput } from '~/common/schema'
import { client } from '../client'
import { formatZodError } from '../utils'

const aiCreated$ = new Subject<CreateAIInput>()

client.on(AiEvent.create, (ai: CreateAIInput) => {
  aiCreated$.next(ai)
})

export async function registerAI(config: CreateAIInput): Promise<AIData> {
  // const { success, data, error } = createAIInput.safeParse(config)

  // if (!success) {
  //   throw new Error(`Invalid AI config: ${formatZodError(error)}`)
  // }

  // const newAI = await client.trpc.ai.registerAi.mutate(data)

  // client.emit(AiEvent.create, newAI)

  // return newAI
}

export async function getAllAIs() {
  return client.invoke<AIData[]>('database.ai.getAllAIs')
}

export function onAIRegistered(callback: (ai: CreateAIInput) => void) {
  const subscription = aiCreated$.subscribe(callback)
  return () => subscription.unsubscribe()
}
