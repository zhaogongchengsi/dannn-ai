import type { Extension } from '../schemas/extension'

type PluginStatus = 'inactive' | 'loading' | 'active' | 'error' | 'reloading'

export interface ExtensionMetadata {
  id: string
  manifest: Extension
  uri: string
  readme?: string | undefined
}

export interface PluginEvents {
  'error': Error
  'loaded': Extension
  'unloaded': void
  'status-changed': PluginStatus
}

export interface CreateExtensionOptions {
  lazyLoad?: boolean
  /**
   * 插件目录
   */
  pluginDir: string
  dirname: string
}
