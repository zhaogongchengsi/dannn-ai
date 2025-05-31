import type { Rpc } from './ipc'
import type { Extension } from '~/common/extension'

export function bootstrap(modules: Extension, rpc: Rpc) {
  if (!rpc.isRegistered('activate')) {
    rpc.register('activate', async () => {
      const activate = module && typeof modules.activate === 'function' ? modules.activate : null
      if (activate) {
        return await activate()
      }
      else {
        return Promise.reject(new Error('extension.activate is not defined in the module'))
      }
    })
  }

  if (!rpc.isRegistered('deactivate')) {
    rpc.register('deactivate', async () => {
      const deactivate = module && typeof modules.deactivate === 'function' ? modules.deactivate : null
      if (deactivate) {
        return await deactivate()
      }
      else {
        return Promise.reject(new Error('extension.deactivate is not defined in the module'))
      }
    })
  }
  else {
    console.warn('extension.deactivate is already registered')
  }
}
