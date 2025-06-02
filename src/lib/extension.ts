import type { Question } from '@/common/schema'
import type { InfoMessage, MessageStatus } from '@/node/database/service/message'
import type { ExtensionMetafile } from '@/node/main/lib/hub'
import { rendererBridge } from './rpc'

/**
 *
 * @param data 要发送的问题数据
 * @description 通过渲染器桥发送问题数据到扩展进程
 */
export function broadcast(data: Question) {
  rendererBridge.emit('extension.question', data)
}

/**
 *
 * @param callback 回调函数，当有新的回答时触发
 */
export function onAnswer(
  callback: (data: InfoMessage) => void,
) {
  rendererBridge.on('window.answer', callback)
}

/**
 *
 * @param callback 回调函数，当AI开始思考时触发
 */
export function onAiThinking(
  callback: (data: { roomId: number, aiId: number, questionId: string }) => void,
) {
  rendererBridge.on('window.ai-thinking', callback)
}

/**
 *
 * @param callback 回调函数，当AI思考结束时触发
 */
export function onAiEndThink(
  callback: (data: { roomId: number, aiId: number, questionId: string }) => void,
) {
  rendererBridge.on('window.ai-endThink', callback)
}

/**
 *
 * @param callback 回调函数，当回答状态更新时触发
 */
export function onAnswerStatusUpdate(
  callback: (data: { messageId: string, status: MessageStatus }) => void,
) {
  rendererBridge.on('window.answer-status-update', callback)
}

/**
 *
 * @returns 所有扩展的元数据
 */
export async function getAllMetafiles() {
  return await window.dannn.ipc.invoke<ExtensionMetafile[]>('extension.get-all-metafiles')
}

export async function setEnvValue(name: string, key: string, value: string) {
  return await window.dannn.ipc.invoke('extension.set-env-value', { name, key, value })
}
