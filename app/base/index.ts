import type { CreateAIInput } from '../common/schema'
import type { AIData, RoomData } from '../common/types'
import type { CreateRoomOptions } from './room'
import { getAllAIs, onAIRegistered, registerAI } from './ai'
import { createRoom, getAllRooms, onRoomCreated } from './room'

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
    register: (opt: ICreateAIConfig, from?: string) => Promise<AIData | null>
    getAllAIs: () => Promise<AIData[]>
  }
}

export function defineExtension(func: (ctx: ExtensionContext) => (void | Promise<void>)) {
  function register(config: ICreateAIConfig, from?: string) {
    // eslint-disable-next-line node/prefer-global/process
    const createBy = from ?? process?.env?.DANNN_PROCESS_PATH

    if (!createBy) {
      throw new Error('createBy is required')
    }

    return registerAI({
      ...config,
      createdBy: createBy,
    })
  }

  const ctx = Object.freeze({
    room: {
      onRoomCreated,
      createRoom,
      getAllRooms,
    },
    ai: {
      onAIRegistered,
      register,
      getAllAIs,
    },
  })

  Promise.resolve(func(ctx))
    .catch((err) => {
      console.error('Extension activate error:', err)
    })
}
