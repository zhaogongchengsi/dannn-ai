// This file is used to expose the ipcRenderer to the renderer process

;(async () => {
  const { contextBridge, ipcRenderer } = await import('electron')
  const process = await import('node:process')
  const fs = await import('node:fs/promises')

  async function readFile(path: string, encoding: BufferEncoding = 'utf-8') {
    return await fs.readFile(path, { encoding })
  }

  async function readDir(
    path: string,
  ): Promise <string[]> {
    return await fs.readdir(path)
  }

  async function validate<T>(value: string) {
    return await ipcRenderer.invoke('validate', value) as T
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
    validate,
  }

  contextBridge.exposeInMainWorld('dannn', dannn)
})()
