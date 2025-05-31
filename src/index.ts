import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { initMarkdownIt } from './lib/shiki'
import { router } from './router'
import { Rpc } from './utils/rpc'
import './assets/index.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

async function bootstrap() {
  await initMarkdownIt()
  app.mount('#app')
}

bootstrap()

const rpc = new Rpc()

window._rpc = rpc.rpc
