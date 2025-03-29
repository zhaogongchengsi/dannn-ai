export interface DnWorkerEvents {
  'error': Error
  'loaded': string
  'unloaded': void
  'status-changed': string
}
