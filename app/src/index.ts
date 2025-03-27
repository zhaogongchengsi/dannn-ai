import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './assets/index.css'

const app = createApp(App)
app.use(router)

window.dannn.ipc.on('window.show', () => {
  document.startViewTransition(() => {
    app.mount('#app')
  })
})

window.dannn.ipc.send('ready')
