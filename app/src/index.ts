import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.css'
import { ExtensionInstance } from './lib/extension'

const app = createApp(App)

window.dannn.ipc.on('show', () => {
  app.mount('#app')
})

window.dannn.ipc.send('ready')

const extension = new ExtensionInstance({
  name: 'test',
  version: '1.0.0',
  mainEntry: 'main.js',
  clientEntry: 'client.js',
  icon: 'icon.png',
  description: 'This is a test extension',
})

extension.load().then(() => {
  console.log('Extension loaded')
})
.catch((error) => {
  console.error('Error loading extension:', error)
})
