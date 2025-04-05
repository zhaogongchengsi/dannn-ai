
import { z } from 'zod'

export const questionMessage = z.object({
	id: z.string(),
	content: z.string(),
	aiReplier: z.string().array(),
})

export const answerMessage = z.object({
	questionId: z.string(),
	content: z.string(),
	aiReplier: z.string(),
})

export type QuestionMessage = z.infer<typeof questionMessage>
export type AnswerMessage = z.infer<typeof answerMessage>