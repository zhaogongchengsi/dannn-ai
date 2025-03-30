import { DnEvent } from './event'

export type Status = 'ready' | 'loading' | 'unloaded' | 'error'

export interface InstallEvents<T> {
  'ready': T
  'loaded': T
  'unloaded': T
  'reload': T
  'load-error': any
  'status-changed': Status
}

export class InstallEvent<T, O = Record<string, string>> extends DnEvent<InstallEvents<T> & O> {}
