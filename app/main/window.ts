import { app, BrowserWindow, nativeImage } from 'electron'
import logo from '../public/logo.png'

export class Window {
  window: BrowserWindow | null = null
  name: string = 'Window'
  constructor(name?: string) {
    this.name = name || this.name
  }

  createWindow() {
    return new Promise<void>((resolve) => {
      app.on('ready', () => {
        const icon = nativeImage.createFromPath(logo)

        this.window = new BrowserWindow({
          width: 800,
          height: 600,
          show: false,
          icon,
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
