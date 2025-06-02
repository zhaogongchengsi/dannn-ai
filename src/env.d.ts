/* eslint-disable ts/no-empty-object-type */
/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'virtual:generated-layouts' {
  import type { RouteRecordRaw } from 'vue-router'

  export function setupLayouts(routes: RouteRecordRaw[]): RouteRecordRaw[]
}

// 递归构造对象的路径
type Path<T, K extends keyof T = keyof T> =
  K extends string
    ? T[K] extends object
      ? `${K}` | `${K}.${Path<T[K]>}`
      : `${K}`
    : never

// 取出路径对应的值类型
type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : P extends keyof T
      ? T[P]
      : never

interface DannnIpc<T> {
  send: (channel: string, ...data: any[]) => void
  on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void
  removeListener: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void
  invoke: <T = any>(channel: string, ...data: any[]) => Promise<T>
}

interface DannnEvent {
  config: {
    get: any
    set: any
  }
}

interface DannnWindow {
  close: () => void
  maximize: () => void
  minimize: () => void
  isMaximized: () => Promise<boolean>
  unmaximize: () => void
  quit: () => void
  name: string
}

interface Dannn {
  ipc: DannnIpc<DannnEvent>
  is: {
    mac: boolean
    win: boolean
    linux: boolean
  }
  // mode: 'prod' | 'dev'
  readFile: (path: string, encoding?: BufferEncoding) => Promise<string>
  readDir: (path: string) => Promise<string[]>
  exists: (dir: string) => Promise<boolean>
  window: DannnWindow
}

interface ConfigData {
  window: {
    width: number
    height: number
  }
  theme: 'light' | 'dark' | 'auto'
}

interface Window {
  /**
   * @description: 主线程注入的方法
   */
  dannn: Dannn
}
