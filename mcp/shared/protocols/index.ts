import type { BaseMessage } from './base'
import type { RegisterServiceMessage, ServiceListRequest, ServiceListResponse } from './discovery'
import type { EventMessage } from './event'
import type { RpcRequest, RpcResponse } from './rpc'

export type McpMessage =
  | RegisterServiceMessage
  | ServiceListRequest
  | ServiceListResponse
  | RpcRequest
  | RpcResponse
  | EventMessage

export {
  BaseMessage,
}
