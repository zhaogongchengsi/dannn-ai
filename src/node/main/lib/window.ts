import EventEmitter from 'node:events'
import { resolve } from 'node:path'
import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron'
import { isMacOS } from 'std-env'
import { logger } from './logger'

export interface WindowOptions {
  width?: number
  height?: number
}

export interface WindowEvents {
  'window.resized': []
  'setting.resized': []
}

export class Window extends EventEmitter<WindowEvents> {
  window: BrowserWindow | null = null
  settingWindow: BrowserWindow | null = null
  name: string = 'window'
  isShow: boolean = false
  isReady: boolean = false
  waitReadyPromise: PromiseWithResolvers<void> | null = null
  preload: string
  icon?: Electron.NativeImage
  constructor(name?: string) {
    super()
    this.name = name || this.name
    this.preload = resolve(__dirname, './preload.js')
    this.icon = nativeImage.createFromPath(resolve(__dirname, './public/icon_256X256.png'))
  }

  async createWindow({ width, height }: WindowOptions = { width: 800, height: 600 }) {
    this.isShow = false
    await app.whenReady()

    this.window = new BrowserWindow({
      width: width ?? 800,
      height: height ?? 600,
      show: false,
      icon: this.icon,
      frame: isMacOS ? true : !app.isPackaged,
      titleBarStyle: isMacOS ? 'hidden' : undefined,
      titleBarOverlay: isMacOS,
      webPreferences: {
        additionalArguments: [`--name=${this.name}`],
        nodeIntegration: true,
        webSecurity: false,
        preload: this.preload,
      },
    })

    if (!app.isPackaged) {
      this.window.loadURL('http://localhost:3001')
      this.window.webContents.openDevTools()
    }
    else {
      this.window.loadFile(resolve(__dirname, './index.html'))
    }

    app.on('activate', () => {
      this.window?.show()
    })

    ipcMain.once('window.ready', () => {
      this.isReady = true
      this.waitReadyPromise?.resolve()
    })

    this.initEvent('window', this.window)

    this.window.on('resized', () => this.emit('window.resized'))
  }

  private initEvent(name: string, window: BrowserWindow) {
    ipcMain.on(`${name}.minimize`, () => {
      window.minimize()
    })

    ipcMain.on(`${name}.unmaximize`, () => {
      window.unmaximize()
    })

    ipcMain.handle(`${name}.isMaximized`, () => {
      return window.isMaximized() || false
    })

    ipcMain.on(`${name}.maximize`, () => {
      if (window.isMaximized()) {
        window.unmaximize()
      }
      else {
        window.maximize()
      }
    })

    ipcMain.handle(`${name}.toggle-devtools`, () => {
      this.toggleDevTools()
    })

    ipcMain.handle(`${name}.quit`, () => {
      logger.info('Quit app')
      window.close()
      window.once('closed', () => {
        this.window = null
        this.settingWindow = null
        this.isShow = false
        this.isReady = false
        logger.info('App quit')
        app.quit()
      })
    })

    const send = (channel: string, ...args: any[]) => {
      this.send(`${name}.${channel}`, ...args)
    }

    window.webContents.on('devtools-opened', () => {
      send('devtools-opened')
    })

    window.webContents.on('devtools-closed', () => {
      send('devtools-closed')
    })

    window.webContents.on('will-navigate', (event, url) => {
      event.preventDefault()
      logger.info('will-navigate', url)

      if (url.startsWith('http://localhost:3001')) {
        window.webContents.reload()
        return
      }

      if (url.startsWith('http')) {
        shell.openExternal(url)
      }
    })

    window.webContents.setWindowOpenHandler(({ url }) => {
      logger.info('setWindowOpenHandler', url)
      // 阻止新窗口打开，并在默认浏览器中打开链接
      if (url.startsWith('http') || url.startsWith('https')) {
        shell.openExternal(url) // 在默认浏览器中打开链接
        return { action: 'deny' } // 阻止新窗口
      }

      return { action: 'allow' } // 允许新窗口
    })

    window.on('resize', () => {
      const { width, height } = this.getSize()
      send('resize', { width, height })
    })

    window.on('maximize', () => {
      send('maximized')
    })

    window.on('unmaximize', () => {
      send('unmaximized')
    })

    window.on('minimize', () => {
      send('minimized')
    })

    window.on('restore', () => {
      send('restored')
    })
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
      this.send('window.show')
      this.show()
    }
    else if (this.waitReadyPromise) {
      await this.waitReadyPromise.promise
      this.send('window.show')
      this.show()
    }
    else {
      throw new Error('Window is not ready')
    }
  }

  toggleDevTools() {
    if (this.window) {
      const webContents = this.window.webContents
      if (webContents.isDevToolsOpened()) {
        webContents.closeDevTools()
      }
      else {
        webContents.openDevTools()
      }
    }
    else {
      throw new Error('Window is not created')
    }
  }
}
