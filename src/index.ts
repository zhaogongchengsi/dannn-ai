import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { Rpc } from './lib/rpc'
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

const rpc = new Rpc()

rpc.rpc.on('window.heartbeat', () => {
  console.log('Heartbeat received from extension')

  rpc.rpc.emit('extension.heartbeat', {
    timestamp: Date.now(),
  })
})
