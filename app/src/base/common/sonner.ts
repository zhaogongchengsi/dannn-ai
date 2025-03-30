import type { ToastT } from 'vue-sonner'
import { DnEvent } from './event'

export type MessageOptions = Pick<ToastT, 'id' | 'type' | 'title' | 'delete' | 'duration' | 'position'>
export interface Message {
  message: string
  options?: MessageOptions
  description?: string
}

export interface MessageEvent {
  message: Message
}

export class Sonner extends DnEvent<MessageEvent> {
  constructor() {
    super()
  }
}

export const sonner = new Sonner()
