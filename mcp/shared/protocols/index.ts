import type { BaseMessage } from './base'
import type { RegisterServiceMessage, ServiceListRequest, ServiceListResponse } from './discovery'
import type { Event } from './event'
import type { RpcRequest, RpcResponse } from './rpc'

export type McpMessage =
  | RegisterServiceMessage
  | ServiceListRequest
  | ServiceListResponse
  | RpcRequest
  | RpcResponse
  | Event

export {
  BaseMessage,
}
