// This file is used to expose the ipcRenderer to the renderer process

; (async () => {
  console.log('preload')
  const { contextBridge, ipcRenderer } = await import('electron')

  contextBridge.exposeInMainWorld('dannn', {
    ipc: {
      send: (channel: string, ...data: any[]) => ipcRenderer.send(channel, ...data),
      on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on(channel, listener),
      removeListener: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.removeListener(channel, listener),
      invoke: async (channel: string, ...data: any[]) => {
        return await ipcRenderer.invoke(channel, ...data)
      },
    },
  } as Dannn)
})()
