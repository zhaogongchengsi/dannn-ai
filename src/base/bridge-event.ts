type Handler = (payload: any) => void

export class BridgeEvent {
  private listeners: Map<string, Set<Handler>> = new Map()

  on(type: string, handler: Handler) {
    if (!this.listeners.has(type))
      this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(handler)
  }

  off(type: string, handler: Handler) {
    this.listeners.get(type)?.delete(handler)
  }

  emit(type: string, payload: any) {
    this.listeners.get(type)?.forEach(fn => fn(payload))
  }

  // 清空
  clear(type?: string) {
    if (type)
      this.listeners.delete(type)
    else this.listeners.clear()
  }

  // 工厂：主进程/子进程消息适配
  static fromProcess(proc: NodeJS.Process | import('child_process').ChildProcess) {
    const bridge = new BridgeEvent()
    proc.on('message', (msg: any) => {
      if (msg?.__bridge)
        bridge.emit(msg.event, msg.payload)
    })
    return bridge
  }

  // 工厂：渲染进程 ipcRenderer 适配
  static fromIpcRenderer(ipc: Electron.IpcRenderer) {
    const bridge = new BridgeEvent()
    ipc.on('bridge-message', (_, msg) => {
      if (msg?.__bridge)
        bridge.emit(msg.event, msg.payload)
    })
    return bridge
  }

  // 工厂：主进程 ipcMain 适配（用于监听来自多个窗口）
  static fromIpcMain(ipc: Electron.IpcMain) {
    const bridge = new BridgeEvent()
    ipc.on('bridge-message', (event, msg) => {
      if (msg?.__bridge) {
        bridge.emit(msg.event, {
          payload: msg.payload,
          reply: (res: any) => event.sender.send('bridge-message', {
            __bridge: true,
            event: `${msg.event}:reply`,
            payload: res,
          }),
        })
      }
    })
    return bridge
  }

  // 工具：封装发消息结构
  send(event: string, payload: any, sendFn: (msg: any) => void) {
    sendFn({ __bridge: true, event, payload })
  }
}
