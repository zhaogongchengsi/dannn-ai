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

  /**
   * 消息发送者 ID
   */
  from: string

  /**
   * 目标接收者 ID
   */
  to: string
}

export interface RpcRegisterMessage extends BaseMessage {
  type: 'rpc'

  /**
   * 支持的方法列表
   */
  method: string

  providerId: string

  /**
   * 附加的元数据
   */
  metadata?: Record<string, any>
}

export interface RpcRegisterMessageResponse extends BaseMessage {
  type: 'rpc'
  /**
   * 是否注册成功
   */
  success: boolean

  /**
   * 错误信息，如果注册失败
   */

  error?: {
    code?: number
    message: string
  }
}

export interface RpcUnregisterMessage extends BaseMessage {
  type: 'rpc'

  /**
   * 注销的服务 ID
   */
  serviceId: string
}

export interface RpcFindMethodsByNameRequest extends BaseMessage {
  type: 'rpc'

  /**
   * 方法名
   */
  method: string

  /**
   * 附加的查询参数
   */
  params?: Record<string, any>

  /**
   * 消息发送者 ID
   */
  from: string
}

export interface RpcFindMethodsByNameResponse extends BaseMessage {
  type: 'rpc'

  /**
   * 匹配到的方法
   */
  method: string

  /**
   * 方法对应的服务 ID
   */
  serviceId: string

  /**
   * 错误信息，如果没有找到方法
   */
  error?: {
    code?: number
    message: string
  }
}
