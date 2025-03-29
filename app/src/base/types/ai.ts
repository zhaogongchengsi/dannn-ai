import type { AI } from '../ai/ai'

export interface CreateAIOptions {
  laze?: boolean
}

export interface AIEvents {
  'error': Error
  'loaded': AI
  'unloaded': void
  'status-changed': string
}
