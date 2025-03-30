import type { DnExtension } from '../extension'
import type { Sidebar, SidebarNode } from './sidebar'

export interface AppEvents {
  'app:ready': void
  'app:load-error': {
    name: string
    error: any
  }
  'app:load-extension': DnExtension
  'app:unload-extension': DnExtension
  'app:reload-extension': DnExtension
  'app:create-sidebar': Sidebar
  'app:remove-sidebar': Sidebar
  'app:create-sidebar-node': SidebarNode
  'error': Error
}
