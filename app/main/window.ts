import { app, BrowserWindow } from 'electron'

export class Window {
  window: BrowserWindow | null = null
  constructor() {}

  createWindow() {
    return new Promise<void>((resolve) => {
      app.on('ready', () => {
        this.window = new BrowserWindow({
          width: 800,
          height: 600,
          show: false,
          webPreferences: {
            nodeIntegration: true,
          },
        })

        if (MODE === 'dev') {
          this.window.loadURL('http://localhost:3001')
          this.window.webContents.openDevTools()
        }
        else {
          this.window.loadFile('./index.html')
        }

        resolve()
      })
    })
  }

  async show() {
    if (this.window) {
      this.window.show()
    }
    else {
      await this.createWindow()
      await this.show()
    }
  }
}
