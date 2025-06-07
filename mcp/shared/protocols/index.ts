import type { BaseMessage } from './base'
import type { RegisterServiceMessage, ServiceListRequest, ServiceListResponse } from './discovery'
import type { EventMessage } from './event'
import type { CreateRoomResponse, GetRoomMembersResponse, GetUserRoomsResponse, RoomResponse } from './room'
import type { RpcRequest, RpcResponse } from './rpc'

export type McpMessage =
  | RegisterServiceMessage
  | ServiceListRequest
  | ServiceListResponse
  | RpcRequest
  | RpcResponse
  | EventMessage

export type McpMessageResponse =
  | ServiceListResponse
  | RpcResponse
  | RoomResponse
  | GetRoomMembersResponse
  | GetUserRoomsResponse
  | CreateRoomResponse

export {
  BaseMessage,
}
