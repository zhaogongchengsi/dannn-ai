import type { Socket } from 'socket.io-client'
import type { Logger } from '../../shared/logger'

export class Rpc {
  constructor(
    private socket: Socket,
    private logger: Logger,
  ) { }

  /**
   * 发送 RPC 调用
   * @param method RPC 方法名
   * @param params 参数
   * @returns RPC 响应结果 Promise
   */
  public async call<T = any>(method: string, params: any): Promise<T> {
    this.logger.debug?.(`[MCP RPC] Calling method ${method}`, params)

    return new Promise((resolve, reject) => {
      this.socket.timeout(5000).emit('rpc', { method, params }, (err: any, result: T) => {
        if (err) {
          this.logger.error(`[MCP RPC] Error calling ${method}:`, err)
          return reject(err)
        }
        resolve(result)
      })
    })
  }
}
