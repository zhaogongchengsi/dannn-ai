import type { Extension } from '~/common/extension'
import { rpc, windowBridge } from './ipc'

export function bootstrap(modules: Extension) {
  windowBridge.on('window.heartbeat', (data) => {
    console.log('Heartbeat received from window:', data)
  })

  setInterval(() => {
    console.log('Sending heartbeat to window')
    windowBridge.emit('extension.heartbeat', {
      timestamp: Date.now(),
    })
  }, 1000 * 5) // 5 minutes

  console.log('Bootstrapping extension')

  if (!rpc.isRegistered('extension.activate')) {
    rpc.register('extension.activate', async () => {
      const activate = modules && typeof modules.activate === 'function' ? modules.activate : null
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
      const deactivate = modules && typeof modules.deactivate === 'function' ? modules.deactivate : null
      if (deactivate) {
        return await deactivate()
      }
      else {
        return Promise.reject(new Error('extension.deactivate is not defined in the module'))
      }
    })
  }

  rpc.emit('extension.ready')
}
