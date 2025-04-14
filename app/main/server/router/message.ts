import type { InfoMessage } from 'common/types'
import { question } from 'common/schema'
import { createQuestion } from '../../database/service/message'
import { publicProcedure, router } from '../trpc'

export const messageRouter = router({
  createQuestion: publicProcedure.input(question).mutation(async ({ input }): Promise<InfoMessage> => {
    return await createQuestion(input)
  }),
})
