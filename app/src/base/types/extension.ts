import type { AIModel } from '@/lib/database/models'

export interface CreateExtensionOptions {
  /**
   * 插件目录
   */
  pluginDir: string
  dirname: string
}

export interface ExtensionEvent {
  'register-ai': AIModel
}
