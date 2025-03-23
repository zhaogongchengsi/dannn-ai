import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.css'

const app = createApp(App)

window.dannn.ipc.on('show', () => {
	app.mount('#app')
})
