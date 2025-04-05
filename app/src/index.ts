import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { createRx } from './base/rxjs'
import { router } from './router'
import './assets/index.css'
import { initMarkdownIt } from './lib/shiki'

const pinia = createPinia()
const app = createApp(App)

app.use(createRx())
app.use(pinia)
app.use(router)

let ok = false
window.dannn.ipc.on('window.show', async () => {
  document.startViewTransition(() => {
    if (!ok) {
      app.mount('#app')
      app.config.globalProperties.$rx.appMount()
      ok = true
    }
  })
})

async function bootstrap() {
  window.dannn.ipc.send('window.ready')
  await initMarkdownIt()
  await new Promise(resolve => setTimeout(resolve, 100))
  if (!ok) {
    requestAnimationFrame(bootstrap)
  }
}
requestAnimationFrame(bootstrap)
