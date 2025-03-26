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

interface Dannn {
  ipc: DannnIpc<DannnEvent>
  is: {
    mac: boolean
    win: boolean
    linux: boolean
  }
  mode: 'prod' | 'dev'
  readFile: (path: string, encoding?: BufferEncoding) => Promise<string>
  readDir: (path: string) => Promise<string[]>
  validate: <T>(value: string) => Promise<T>
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
  /** AI 名称 */
  name: string

  /** AI 介绍 */
  description?: string

  /** AI 角色 */
  role?: string

  /** AI 提示词 */
  prompt?: string

  /** AI 类型（文本、图像、音频、视频） */
  type: 'text' | 'image' | 'audio' | 'video'

  /** 支持的模型列表 */
  models: string[]

  /** 生成文本的随机性（0-1），0.0 更确定，1.0 更随机 */
  temperature?: number

  /** 生成的最大 Token 数 */
  maxTokens?: number

  /** 采样概率，替代 temperature，用于控制输出多样性 */
  topP?: number

  /** 频率惩罚，让 AI 避免重复性高的词汇 */
  frequencyPenalty?: number

  /** 话题惩罚，让 AI 更容易引入新话题 */
  presencePenalty?: number

  /** AI API 的调用地址 */
  apiEndpoint?: string

  /** AI 访问所需的 API Key */
  apiKey?: string

  /** 额外自定义参数 */
  customParams?: Record<string, any>

  /** AI 可调用的函数定义 */
  functionCalls?: FunctionCall[]
}

interface FunctionCall {
  /** 函数名 */
  name: string

  /** 函数描述 */
  description?: string

  /** 函数参数定义（JSON Schema 格式） */
  parameters: Record<string, any>

  /** 该函数是否必须调用 */
  required?: boolean
}

type Extensions = Extension[]

interface Window {
  dannn: Dannn
}
