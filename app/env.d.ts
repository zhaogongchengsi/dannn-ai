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
  theme: 'light' | 'dark' | 'auto'
}

interface Extension {
  name: string
  version: string
  icon?: string
  description?: string
  author?: string
  homepage?: string
  /**
   * The entry file
   */
  main?: string
  aiCollection?: CollectionAI[]
}

interface CollectionAI {
  name: string // AI 名称
  description?: string // AI 介绍
  role?: string // AI 角色
  prompt?: string // AI 提示词
  type: 'text' | 'image' | 'audio' | 'video' // AI 类型
  models: string[] // 支持的模型列表
}

type Extensions = Extension[]

interface Window {
  dannn: Dannn
}
