import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.css'
import { router } from './router'

const app = createApp(App)
app.use(router)

window.dannn.ipc.on('show', () => {
  document.startViewTransition(() => {
    app.mount('#app')
  })
})

window.dannn.ipc.send('ready')
