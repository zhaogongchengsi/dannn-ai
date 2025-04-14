import type { CreateAIInput } from 'common/schema'
import type { AIData, RoomData } from 'common/types'
import type { AI } from './ai'
import type { CreateRoomOptions } from './api/room'

export type ICreateAIConfig = Omit<CreateAIInput, 'createBy'>
export type INewRoom = Omit<RoomData, 'participant'>
export interface ExtensionContext {
  room: {
    onRoomCreated: (callback: (room: INewRoom) => void) => () => void
    createRoom: (opt: CreateRoomOptions) => Promise<INewRoom>
    getAllRooms: () => Promise<INewRoom[]>
  }
  ai: {
    onAIRegistered: (callback: (ai: CreateAIInput) => void) => () => void
    register: (opt: ICreateAIConfig, from?: string) => Promise<AI>
    getAllAIs: () => Promise<AIData[]>
  }
}
