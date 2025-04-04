
import { z } from 'zod'

export const channelMessage = z.object({
	content: z.string(),
	aiReplier: z.string().array(),
})

export type ChannelMessage = z.infer<typeof channelMessage>