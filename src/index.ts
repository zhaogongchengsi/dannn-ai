import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { initMarkdownIt } from './lib/shiki'
import { router } from './router'
import './assets/index.css'
import { Rpc } from '~/lib/rpc'
import type { DatabaseRouter } from './node/database/router'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

async function bootstrap() {
  await initMarkdownIt()
  app.mount('#app')
}

bootstrap()

