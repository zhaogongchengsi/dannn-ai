import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import logo from '../../public/logo.png'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export class Window {
  window: BrowserWindow | null = null
  name: string = 'Window'
  isShow: boolean = false
  isReady: boolean = false
  waitReadyPromise: PromiseWithResolvers<void> | null = null
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

    ipcMain.on('ready', () => {
      this.isReady = true
      this.waitReadyPromise?.resolve()
    })
  }

  send(channel: string, ...args: any[]) {
    this.window?.webContents.send(channel, ...args)
  }

  async display() {
    if (this.window && !this.isShow) {
      this.window.show()
      this.isShow = true
      this.waitReadyPromise =  Promise.withResolvers<void>()
    }
    else {
      await this.createWindow()
      await this.display()
    }
  }

  async show() {
    if (this.isReady) {
      this.send('show')
    }
    else if (this.waitReadyPromise) {
      await this.waitReadyPromise.promise
      this.send('show')
    } else {
      throw new Error('Window is not ready')
    }
  }
}
