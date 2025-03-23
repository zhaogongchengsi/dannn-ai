import { app, BrowserWindow, nativeImage } from 'electron'
import logo from '../../public/logo.png'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export class Window {
  window: BrowserWindow | null = null
  name: string = 'Window'
  isShow: boolean = false
  constructor(name?: string) {
    this.name = name || this.name
  }

  async createWindow() {
    this.isShow = false
    await app.whenReady()
    const icon = nativeImage.createFromPath(logo)

    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      icon,
      webPreferences: {
        nodeIntegration: true,
        preload: resolve(dirname(fileURLToPath(import.meta.url)),'./preload.js'),
      },
    })

    if (MODE === 'dev') {
      this.window.loadURL('http://localhost:3001')
      this.window.webContents.openDevTools()
    }
    else {
      this.window.loadFile('./index.html')
    }

    app.on('activate', () => {
        this.window?.show()
    })
  }

  async show() {
    if (this.window && !this.isShow) {
      this.window.show()
      this.isShow = true
    }
    else {
      await this.createWindow()
      await this.show()
    }
  }
}
