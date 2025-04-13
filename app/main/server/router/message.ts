import { InfoMessage } from 'common/types'
import { createQuestion } from '../../database/service/message'
import { publicProcedure, router } from '../trpc'
import { question } from 'common/schema'

export const messageRouter = router({
	createQuestion: publicProcedure.input(question).mutation(async ({ input }) :Promise<InfoMessage> => {
		return await createQuestion(input)
	}),
})
