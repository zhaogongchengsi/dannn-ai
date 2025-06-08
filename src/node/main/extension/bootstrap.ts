import type { Extension } from './type'
import { ExtensionContext } from './context'
import { rpc } from './ipc'

export function bootstrap(modules: Extension) {
  const context = new ExtensionContext()
 
  if (!rpc.isRegistered('_extension.activate')) {
    rpc.register('_extension.activate', async () => {
      await context.mcpConnect()
      const activate = modules && typeof modules.activate === 'function' ? modules.activate : null
      if (activate) {
        return await activate(context)
      }
    })
  }

  if (!rpc.isRegistered('_extension.deactivate')) {
    rpc.register('_extension.deactivate', async () => {
      context.mcpDisconnect()
      const deactivate = modules && typeof modules.deactivate === 'function' ? modules.deactivate : null
      if (deactivate) {
        return await deactivate()
      }
    })
  }

  rpc.emit('_extension.ready')
}
