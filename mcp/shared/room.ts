// 在文件顶部添加以下接口定义
export interface RoomRequest {
  id: string
  roomId: string
  timestamp: number
}

export interface RoomResponse {
  id: string
  success: boolean
  roomId: string
  error?: string
  timestamp: number
}

export interface GetRoomMembersResponse extends RoomResponse {
  members: string[]
}

export interface GetUserRoomsResponse {
  id: string
  success: boolean
  rooms: string[]
  error?: string
  timestamp: number
}

export interface CreateRoomRequest {
  id: string
  roomId?: string
  invitedUsers?: string[]
  timestamp: number
}

export interface CreateRoomResponse {
  id: string
  success: boolean
  roomId: string
  error?: string
  timestamp: number
}
