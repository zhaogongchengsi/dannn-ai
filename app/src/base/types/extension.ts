import type { Extension } from '@dannn/schemas'

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
