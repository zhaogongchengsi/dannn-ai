import type { Question } from '@/common/schema'
import type { InfoMessage } from '@/node/database/service/message'
import { rendererBridge } from './rpc'

export function broadcast(data: Question) {
  rendererBridge.emit('extension.question', data)
}

export function onQuestion(
  callback: (data: InfoMessage) => void,
) {
  rendererBridge.on('window.answer', callback)
}

export function onAiThinking(
  callback: (data: { roomId: number, aiId: number, questionId: string }) => void,
) {
  rendererBridge.on('window.ai-thinking', callback)
}

export function onAiEndThink(
  callback: (data: { roomId: number, aiId: number, questionId: string }) => void,
) {
  rendererBridge.on('window.ai-endThink', callback)
}
