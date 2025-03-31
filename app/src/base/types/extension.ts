import type { Extension } from '../schemas/extension'
import type { Sidebar } from './sidebar'

export interface ExtensionMetadata {
  id: string
  manifest: Extension
  uri: string
  readme?: string | undefined
}

export interface CreateExtensionOptions {
  /**
   * 插件目录
   */
  pluginDir: string
  dirname: string
}

export interface SidebarModules {
  getAllSidebars: () => Promise<Sidebar[]>
  getSidebar: (id: string) => Promise<Sidebar | undefined>
  createSidebar: (sidebar: Sidebar) => Promise<Sidebar>
}

export type ExtensionNeedModule = SidebarModules
