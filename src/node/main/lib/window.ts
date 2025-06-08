import type { BridgeRequest } from '~/common/bridge'
import type { ToastConfig } from '~/common/schema'
import { resolve } from 'node:path'
import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron'
import { BehaviorSubject } from 'rxjs'
import { isMacOS } from 'std-env'
import { Bridge } from '~/common/bridge'
import { registerRouterToBridge } from '~/common/router'
import { toastConfig } from '~/common/schema'
import { databaseRouter } from '~/node/database/router'
import { logger } from './logger'

export interface WindowOptions {
  width?: number
  height?: number
  currentUrl?: string
  port?: number
}

export interface WindowEvents {
  resized: []
}

export class Window extends Bridge {
  window: BrowserWindow | null = null
  settingWindow: BrowserWindow | null = null
  name: string = 'window'
  isShow: boolean = false
  isReady: boolean = false
  waitReadyPromise: PromiseWithResolvers<void> | null = null
  preload: string
  icon?: Electron.NativeImage

  notificationReady = false
  waitNotificationReady = new BehaviorSubject<boolean>(false)
  waitNotificationLoop: ToastConfig[] = []

  constructor(name?: string) {
    super()
    this.name = name || this.name
    this.preload = resolve(__dirname, './preload.js')
    this.icon = nativeImage.createFromPath(resolve(__dirname, './public/icon_256X256.png'))
    ipcMain.on('trpc:message', (_, args) => {
      if (args) {
        this.onMessage(args)
      }
    })

    // 监听通知准备就绪事件
    ipcMain.once('notification.ready', () => {
      this.notificationReady = true
      this.waitNotificationReady.next(true)
      // 如果通知已经准备好，立即发送等待中的通知
      this.waitNotificationLoop.forEach((config) => {
        this.toast(config)
      })
    })

    // 赋予扩展进程的 操控database 的权限 并且避免被转发
    registerRouterToBridge(this, databaseRouter, 'database')
  }

  async createWindow({ width, height, currentUrl, port }: WindowOptions = { width: 800, height: 600 }) {
    this.isShow = false
    await app.whenReady()

    const minWidth = 800
    const minHeight = 540

    const _port = port || process.env.MCP_PORT

    this.window = new BrowserWindow({
      width: width ?? 800,
      height: height ?? 600,
      show: false,
      icon: this.icon,
      minWidth,
      minHeight,
      frame: isMacOS ? true : !app.isPackaged,
      titleBarStyle: isMacOS ? 'hidden' : undefined,
      titleBarOverlay: isMacOS,
      trafficLightPosition: { x: 10, y: 10 },
      webPreferences: {
        additionalArguments: [`--name=${this.name}`, _port ? `--port=${_port}` : ''].filter(Boolean),
        nodeIntegration: true,
        webSecurity: false,
        preload: this.preload,
      },
    })

    if (!app.isPackaged) {
      this.window.loadURL(`http://localhost:3001${currentUrl || ''}`)
      this.window.webContents.openDevTools()
    }
    else {
      this.window.loadFile(resolve(__dirname, `./index.html${currentUrl || ''}`))
    }

    app.on('activate', () => {
      this.window?.show()
    })

    ipcMain.once('window.ready', () => {
      this.isReady = true
      this.waitReadyPromise?.resolve()
    })

    this.initEvent('window', this.window)

    this.window.on('resized', () => this.emit('resized'))
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
      this.sendToWeb(`${name}.${channel}`, ...args)
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

  sendToWeb(channel: string, ...args: any[]) {
    this.window?.webContents.send(channel, ...args)
  }

  send(data: BridgeRequest) {
    if (this.window) {
      this.window.webContents.send('trpc:message', data)
    }
    else {
      throw new Error('Window is not created')
    }
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
      this.sendToWeb('window.show')
      this.show()
    }
    else if (this.waitReadyPromise) {
      await this.waitReadyPromise.promise
      this.sendToWeb('window.show')
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

  isMinimized() {
    if (this.window) {
      return this.window.isMinimized()
    }
    else {
      throw new Error('Window is not created')
    }
  }

  restore() {
    if (this.window) {
      this.window.restore()
    }
    else {
      throw new Error('Window is not created')
    }
  }

  focus() {
    if (this.window) {
      this.window.focus()
    }
    else {
      throw new Error('Window is not created')
    }
  }

  toast(config: ToastConfig) {
    const toast = (config: ToastConfig) => {
      const { success, data } = toastConfig.safeParse(config)
      if (!success) {
        logger.error('Invalid toast config', data)
        return
      }

      const action = data.action

      const newData = {
        ...data,
        action: action
          ? {
              label: action.label,
              onClick: ('onClick' in action && typeof action.onClick === 'function'),
            }
          : undefined,
      }

      this.invoke<boolean>('notification', newData)
        .then(() => {
          action && 'onClick' in action && typeof action.onClick === 'function' && action.onClick()
        })
        .catch((error) => {
          logger.error('Failed to show toast notification', error)
        })
    }

    if (this.notificationReady) {
      toast(config)
      return
    }

    this.waitNotificationReady.subscribe((ready) => {
      if (ready) {
        toast(config)
      }
      else {
        this.waitNotificationLoop.push(config)
      }
    })
  }
}
