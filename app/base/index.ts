import { getAllAIs, onAIRegistered, registerAI } from './api/ai'
import { createRoom, getAllRooms, onRoomCreated } from './api/room'
import { AI } from './ai'
import { ExtensionContext, ICreateAIConfig } from './type'

export function defineExtension(func: (ctx: ExtensionContext) => (void | Promise<void>)) {
	async function register(config: ICreateAIConfig, from?: string) {
		// eslint-disable-next-line node/prefer-global/process
		const createBy = from ?? process?.env?.DANNN_PROCESS_PATH

		if (!createBy) {
			throw new Error('createBy is required')
		}

		const data = await registerAI({
			...config,
			createdBy: createBy,
		})

		return new AI(data)
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
