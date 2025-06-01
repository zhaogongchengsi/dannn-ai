import type { Question } from '@/common/schema'
import { rendererBridge } from './rpc'

export function broadcast(data: Question) {
  rendererBridge.emit('extension.question', data)
}
