import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { extensionSubject } from './lib/rxjs/extension'
import { AIPlugin } from './plugin/ai'
import { router } from './router'
import './assets/index.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(AIPlugin())

let ok = false
window.dannn.ipc.on('window.show', () => {
  extensionSubject.loadExtensions()
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
