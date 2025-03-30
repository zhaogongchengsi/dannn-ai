import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './base/app/app'
import './assets/index.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

let ok = false
window.dannn.ipc.on('window.show', async () => {
  document.startViewTransition(() => {
    if (!ok)
      app.mount('#app')
    ok = true
  })
})

async function bootstrap() {
  window.dnapp.init()
  window.dannn.ipc.send('window.ready')
  await new Promise(resolve => setTimeout(resolve, 100))
  if (!ok) {
    requestAnimationFrame(bootstrap)
  }
}
requestAnimationFrame(bootstrap)
