import type { Extension } from '~/common/extension'
import { rpc } from './ipc'

export function bootstrap(modules: Extension) {
  if (!rpc.isRegistered('_extension.activate')) {
    rpc.register('_extension.activate', async () => {
      const activate = modules && typeof modules.activate === 'function' ? modules.activate : null
      if (activate) {
        return await activate()
      }
      else {
        return Promise.reject(new Error('extension.activate is not defined in the module'))
      }
    })
  }

  if (!rpc.isRegistered('_extension.deactivate')) {
    rpc.register('_extension.deactivate', async () => {
      const deactivate = modules && typeof modules.deactivate === 'function' ? modules.deactivate : null
      if (deactivate) {
        return await deactivate()
      }
      else {
        return Promise.reject(new Error('extension.deactivate is not defined in the module'))
      }
    })
  }

  rpc.emit('_extension.ready')
}
