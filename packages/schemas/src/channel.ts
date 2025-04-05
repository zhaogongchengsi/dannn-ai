
import { z } from 'zod'

export const questionMessage = z.object({
	id: z.string(),
	content: z.string(),
	aiReplier: z.string().array(),
})

export const completeAnswerMessage = z.object({
	type: z.literal('content'),
	questionId: z.string(),
	content: z.string(),
	aiReplier: z.string(),
})


export const streamAnswerMessage = z.object({
	type: z.literal('stream'),
	id: z.number(),
	questionId: z.string(),
	content: z.string(),
	aiReplier: z.string(),
	complete: z.boolean(),
})

const answerMessage = z.union([completeAnswerMessage, streamAnswerMessage])

export type QuestionMessage = z.infer<typeof questionMessage>
export type AnswerMessage = z.infer<typeof answerMessage>