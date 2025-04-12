import { onRoomCreated, createRoom, getAllRooms, CreateRoomOptions } from './room'
import { onAIRegistered, registerAI, getAllAIs } from './ai'
import { AIData, RoomData } from '../common/types'
import { CreateAIInput } from '../common/schema'

export interface ExtensionContext {
	room: {
		onRoomCreated: (callback: (room: RoomData) => void) => () => void
		createRoom: (opt: CreateRoomOptions) => Promise<RoomData>
		getAllRooms: () => Promise<RoomData[]>
	}
	ai: {
		onAIRegistered: (callback: (ai: CreateAIInput) => void) => () => void
		registerAI: (opt: CreateAIInput) => Promise<AIData | null>
		getAllAIs: () => Promise<AIData[]>
	}
}

export function defineExtension(func: (ctx: ExtensionContext) => (void | Promise<void>)) {
	const ctx = {
		room: {
			onRoomCreated,
			createRoom,
			getAllRooms
		},
		ai: {
			onAIRegistered,
			registerAI,
			getAllAIs
		}
	}

	Promise.resolve(func(ctx))
		.catch((err) => {
			console.error("Extension activate error:", err)
		})
}