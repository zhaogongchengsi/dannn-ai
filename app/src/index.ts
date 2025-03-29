import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { dannnPlugin } from './lib/plugin'
import { router } from './router'
import './assets/index.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

let ok = false
window.dannn.ipc.on('window.show', async () => {
  dannnPlugin.loadLocalExtensions()
  document.startViewTransition(() => {
    app.mount('#app')
    ok = true
  })
})

async function bootstrap() {
  window.dannn.ipc.send('window.ready')
  await new Promise(resolve => setTimeout(resolve, 100))
  if (!ok) {
    requestAnimationFrame(bootstrap)
  }
}
requestAnimationFrame(bootstrap)
