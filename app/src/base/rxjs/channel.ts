import type { ChannelMessage } from '@dannn/schemas'
import { Subject } from 'rxjs'

export const toWorkerChannel = new Subject<ChannelMessage>()
export const formWorkerChannel = new Subject<ChannelMessage>()

export function onToWorkerChannel(
  callback: (message: ChannelMessage) => void,
): () => void {
  const subscription = toWorkerChannel.subscribe(callback)
  return () => subscription.unsubscribe()
}

export function onFormWorkerChannel(
  callback: (message: ChannelMessage) => void,
): () => void {
  const subscription = formWorkerChannel.subscribe(callback)
  return () => subscription.unsubscribe()
}

export function sendToWorkerChannel(message: ChannelMessage): void {
  toWorkerChannel.next(message)
}

export function sendFormWorkerChannel(message: ChannelMessage): void {
  formWorkerChannel.next(message)
}
