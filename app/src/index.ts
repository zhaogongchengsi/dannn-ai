import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { room } from '../base/index'
import App from './App.vue'
import { initMarkdownIt } from './lib/shiki'
import { router } from './router'
import './assets/index.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

let ok = false
window.dannn.ipc.on('window.show', async () => {
  document.startViewTransition(() => {
    if (!ok) {
      app.mount('#app')
      ok = true
    }
  })
})

async function bootstrap() {
  await initMarkdownIt()
  window.dannn.ipc.send('window.ready')
  await new Promise(resolve => setTimeout(resolve, 100))
  if (!ok) {
    requestAnimationFrame(bootstrap)
  }
}
requestAnimationFrame(bootstrap)

console.log(room)
