import type { Extension } from '~/common/extension'
import { rpc } from './ipc'

export function bootstrap(modules: Extension) {
  if (!rpc.isRegistered('extension.activate')) {
    rpc.register('extension.activate', async () => {
      const activate = module && typeof modules.activate === 'function' ? modules.activate : null
      if (activate) {
        return await activate()
      }
      else {
        return Promise.reject(new Error('extension.activate is not defined in the module'))
      }
    })
  }

  if (!rpc.isRegistered('extension.deactivate')) {
    rpc.register('extension.deactivate', async () => {
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
