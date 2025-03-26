// This file is used to expose the ipcRenderer to the renderer process

; (async () => {
  const { contextBridge, ipcRenderer } = await import('electron')
  const process = await import('node:process')
  const fs = await import('node:fs/promises')

  function readFile(path: string, encoding: BufferEncoding = 'utf-8') {
    return fs.readFile(path, { encoding })
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
  }

  contextBridge.exposeInMainWorld('dannn', dannn)
})()
