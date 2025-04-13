import { CreateAIInput } from "common/schema"
import { RoomData, AIData } from "common/types"
import { CreateRoomOptions } from "./api/room"
import { AI } from "./ai"

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