import type { BaseMessage } from './base'

/**
 * RPC 请求消息
 */
export interface RpcRequest extends BaseMessage {
  type: 'rpc'

  /**
   * 调用的方法名
   * 例如 "getUserInfo"、"sendMessage"
   */
  method: string

  /**
   * 请求参数
   */
  params?: unknown

  /**
   * 消息发送者 ID，例如插件 ID、客户端 ID
   */
  from: string

  /**
   * 目标接收者 ID，支持点对点调用
   * 也可以是广播特殊标记
   */
  to: string
}

/**
 * RPC 响应消息
 */
export interface RpcResponse extends BaseMessage {
  type: 'rpc'

  /**
   * 调用对应的请求 ID
   */
  id: string

  /**
   * 返回结果
   */
  result?: unknown

  /**
   * 错误信息，若调用失败
   */
  error?: {
    code?: number
    message: string
  }
}
