import { app } from 'electron'
import { Window } from './lib/window'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

if (!app.requestSingleInstanceLock()) {
	app.quit()
}

const window = new Window()

async function bootstrap() {
	window.show()
	app.on('activate', () => {
		window.show()
	})
}

bootstrap()

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})