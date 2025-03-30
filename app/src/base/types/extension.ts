import type { Extension } from '../schemas/extension'

export interface ExtensionMetadata {
  id: string
  manifest: Extension
  uri: string
  readme?: string | undefined
}

export interface CreateExtensionOptions {
  lazyLoad?: boolean
  /**
   * 插件目录
   */
  pluginDir: string
  dirname: string
}
