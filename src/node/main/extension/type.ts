import type { ExtensionContext } from './context'

export interface Extension {
  activate?: (ctx: ExtensionContext) => void | Promise<void>
  deactivate?: () => void | Promise<void>
}
