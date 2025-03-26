import EventEmitter from 'node:events'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import logo from '../../public/logo.png'

export interface WindowOptions {
  width?: number
  height?: number
}

export interface WindowEvents {
  resized: []
}

export class Window extends EventEmitter<WindowEvents> {
  window: BrowserWindow | null = null
  name: string = 'Window'
  isShow: boolean = false
  isReady: boolean = false
  waitReadyPromise: PromiseWithResolvers<void> | null = null
  constructor(name?: string) {
    super()
    this.name = name || this.name
  }

  async createWindow({ width, height }: WindowOptions = { width: 800, height: 600 }) {
    this.isShow = false
    await app.whenReady()
    const icon = nativeImage.createFromPath(logo)

    this.window = new BrowserWindow({
      width: width ?? 800,
      height: height ?? 600,
      show: false,
      icon,
      frame: MODE === 'dev',
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        preload: resolve(dirname(fileURLToPath(import.meta.url)), './preload.js'),
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

    ipcMain.once('ready', () => {
      this.isReady = true
      this.waitReadyPromise?.resolve()
    })

    ipcMain.on('minimize', () => {
      this.window?.minimize()
    })

    ipcMain.on('maximize', () => {
      if (this.window?.isMaximized()) {
        this.window.unmaximize()
      }
      else {
        this.window?.maximize()
      }
    })

    this.window.on('resize', () => {
      const { width, height } = this.getSize()
      this.send('window-resized', { width, height })
    })

    this.window.on('maximize', () => {
      this.send('window-maximized')
    })

    this.window.on('unmaximize', () => {
      this.send('window-unmaximized')
    })

    this.window.on('minimize', () => {
      this.send('window-minimized')
    })

    this.window.on('restore', () => {
      this.send('window-restored')
    })

    ipcMain.on('close', () => {
      this.window?.close()
    })

    this.window.on('resized', () => this.emit('resized'))
  }

  getSize() {
    const [width, height] = this.window?.getSize() || [0, 0]
    return { width, height }
  }

  send(channel: string, ...args: any[]) {
    this.window?.webContents.send(channel, ...args)
  }

  async display(opt?: WindowOptions) {
    if (this.window && !this.isShow) {
      this.window.show()
      this.isShow = true
      this.waitReadyPromise = Promise.withResolvers<void>()
    }
    else {
      await this.createWindow(opt)
      await this.display(opt)
    }
  }

  async show() {
    if (this.isReady) {
      this.send('show')
      this.window?.webContents.once('did-start-loading', () => {
        ipcMain.once('ready', () => {
          this.show()
        })
      })
    }
    else if (this.waitReadyPromise) {
      await this.waitReadyPromise.promise
      this.send('show')
      this.waitReadyPromise = null
      this.window?.webContents.once('did-start-loading', () => {
        ipcMain.once('ready', () => {
          this.show()
        })
      })
    }
    else {
      throw new Error('Window is not ready')
    }
  }
}
