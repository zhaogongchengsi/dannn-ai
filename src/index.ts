import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { extensionBridge } from './lib/rpc'
import { initMarkdownIt } from './lib/shiki'
import { router } from './router'
import './assets/index.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

async function bootstrap() {
  initMarkdownIt()
  app.mount('#app')
}

bootstrap()

extensionBridge.on('extension.heartbeat', () => {
  console.log('Heartbeat received from extension')

  extensionBridge.emit('window.heartbeat', {
    timestamp: Date.now(),
  })
})
