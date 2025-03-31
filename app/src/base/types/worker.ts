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

export interface WorkerCallMessage {
  type: 'call'
  id: string
  name: string
  args: any[]
}

export type WorkerMessage = WorkerCallMessage |
  WorkerDoneMessage |
  WorkerErrorMessage |
  WorkerCallResultMessage |
  WorkerCallErrorMessage |
  WorkerModuleMessage
