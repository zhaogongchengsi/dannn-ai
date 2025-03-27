// This file is used to expose the ipcRenderer to the renderer process

;(async () => {
  const { contextBridge, ipcRenderer } = await import('electron')
  const process = await import('node:process')
  const fs = await import('node:fs/promises')
  const fsSync = await import('node:fs')

  const NAME = (process.argv.find(arg => arg.startsWith('--name='))?.split('=')[1] || '').toLocaleLowerCase()

  async function readFile(path: string, encoding: BufferEncoding = 'utf-8') {
    return await fs.readFile(path, { encoding })
  }

  async function readDir(
    path: string,
  ): Promise <string[]> {
    return await fs.readdir(path)
  }

  async function exists(dir: string) {
    return fsSync.existsSync(dir)
  }

  /**
   * 关闭窗口
   */
  function close() {
    ipcRenderer.send(`${NAME}.close`)
  }

  /**
   * 放大窗口
   */
  function maximize() {
    ipcRenderer.send(`${NAME}.maximize`)
  }

  /**
   * 缩小窗口
   */
  function minimize() {
    ipcRenderer.send(`${NAME}.minimize`)
  }

  function unmaximize() {
    ipcRenderer.send(`${NAME}.unmaximize`)
  }

  function isMaximized() {
    return ipcRenderer.invoke(`${NAME}.isMaximized`)
  }

  async function getEnv(keys: string[]): Promise<Record<string, string | undefined>> {
    return ipcRenderer.invoke('env.get', keys)
  }

  const is = {
    mac: process.platform === 'darwin',
    win: process.platform === 'win32',
    linux: process.platform === 'linux',
  }

  const dannn: Dannn = {
    ipc: {
      send: (channel: string, ...data: any[]) => ipcRenderer.send(channel, ...data),
      on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on(channel, listener),
      removeListener: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.removeListener(channel, listener),
      invoke: async (channel: string, ...data: any[]) => {
        return await ipcRenderer.invoke(channel, ...data)
      },
    },
    is,
    mode: MODE,
    readFile,
    readDir,
    exists,
    getEnv,
    window: {
      name: NAME,
      close,
      maximize,
      unmaximize,
      minimize,
      isMaximized,
    },
  }

  contextBridge.exposeInMainWorld('dannn', dannn)
})()
