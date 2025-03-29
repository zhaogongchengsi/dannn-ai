import type { DnExtension } from '../extension'

export interface AppEvents {
  'app:ready': void
  'app:load-error': {
    name: string
    error: any
  }
  'app:load-extension': DnExtension
  'app:unload-extension': DnExtension
  'app:reload-extension': DnExtension
  'error': Error
}
