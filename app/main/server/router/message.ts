import type { InfoMessage } from 'common/types'
import { answer, question } from 'common/schema'
import { createAiAnswer, createQuestion } from '../../database/service/message'
import { publicProcedure, router } from '../trpc'

export const messageRouter = router({
  createQuestion: publicProcedure.input(question).mutation(async ({ input }): Promise<InfoMessage> => {
    return await createQuestion(input)
  }),
  createAiAnswer: publicProcedure.input(answer).mutation(async ({ input }): Promise<InfoMessage> => {
    return await createAiAnswer(input)
  }),
})
