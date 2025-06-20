import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { client } from './lib/rpc'
import { initMarkdownIt } from './lib/shiki'
import { router } from './router'
import './assets/index.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

async function bootstrap() {
  initMarkdownIt()
  client.connect()
  app.mount('#app')
}

bootstrap()
