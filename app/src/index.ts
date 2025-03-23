import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.css'
import { useConfigState } from './composables/config.js'

const app = createApp(App)
const config = useConfigState()

window.dannn.ipc.on('show', () => {
	config.init()
	app.mount('#app')
})

window.dannn.ipc.send('ready')
