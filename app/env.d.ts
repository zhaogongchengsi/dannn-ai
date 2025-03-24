interface DannnIpc {
  send: (channel: string, ...data: any[]) => void
  on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void
  removeListener: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void
  invoke: <T = any>(channel: string, ...data: any[]) => Promise<T>
}

interface Dannn {
  ipc: DannnIpc
}

interface ConfigData {
  window: {
    width: number
    height: number
  }
  theme: 'light' | 'dark' | 'system'
}

interface Extension {
  name: string
  version: string
  icon?: string
  description?: string
  author?: string
  homepage?: string
  /**
   * The main entry file
   */
  mainEntry?: string
  /**
   * The client entry file
   */
  clientEntry?: string
}

type Extensions = Extension[]

interface Window {
  dannn: Dannn
}
