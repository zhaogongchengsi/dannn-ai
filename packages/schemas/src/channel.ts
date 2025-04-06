
import { z } from 'zod'

export const questionMessage = z.object({
	id: z.string(),
	chatId: z.string(),
	content: z.string(),
	aiReplier: z.string().array(),
})

export const completeAnswerMessage = z.object({
	chatId: z.string(),
	type: z.literal('content'),
	questionId: z.string(),
	content: z.string(),
	aiReplier: z.string(),
	createAt: z.number(),
})


export const streamAnswerMessage = z.object({
	id: z.string(),
	sortId: z.number(),
	chatId: z.string(),
	type: z.literal('stream'),
	questionId: z.string(),
	content: z.string(),
	aiReplier: z.string(),
	complete: z.boolean(),
	createAt: z.number(),
})

const answerMessage = z.union([completeAnswerMessage, streamAnswerMessage])

export type CompleteAnswerMessage = z.infer<typeof completeAnswerMessage>
export type StreamAnswerMessage = z.infer<typeof streamAnswerMessage>
export type QuestionMessage = z.infer<typeof questionMessage>
export type AnswerMessage = z.infer<typeof answerMessage>