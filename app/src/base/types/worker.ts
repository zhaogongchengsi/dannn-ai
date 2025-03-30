export interface WorkerDoneMessage {
  type: 'done'
}

export interface WorkerErrorMessage {
  type: 'error'
  error: string
}

export interface WorkerCallResultMessage {
  type: 'call-result'
  id: string
  result: any
}

export interface WorkerCallErrorMessage {
  type: 'call-error'
  id: string
  error: string
}

export interface WorkerModuleMessage {
  type: 'module'
  name: string
}

export type WorkerMessage = WorkerDoneMessage | WorkerErrorMessage | WorkerCallResultMessage | WorkerCallErrorMessage | WorkerModuleMessage

export interface DnWorkerEvents {
  'error': Error
  'loaded': string
  'unloaded': void
  'status-changed': string
  'worker:message': WorkerMessage
  'worker:error': any
  'worker:messageerror': any
  'worker:log': {
    level: keyof Console
    messages: string[]
  }
}
