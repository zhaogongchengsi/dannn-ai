import type { InfoMessage } from '~/common/types'
import { z } from 'zod'
import { pageConfig } from '~/common/page'
import { answer, question } from '~/common/schema'
import { createAiAnswer, createQuestion, getMessagesByPageDesc } from '~/node/database/service/message'
import { publicProcedure, router } from '../trpc'

export const messageRouter = router({
  createQuestion: publicProcedure.input(question).mutation(async ({ input }): Promise<InfoMessage> => {
    return await createQuestion(input)
  }),
  createAiAnswer: publicProcedure.input(answer).mutation(async ({ input }): Promise<InfoMessage> => {
    return await createAiAnswer(input)
  }),
  getMessageByPage: publicProcedure.input(pageConfig.extend({
    roomId: z.number(),
  })).query(async ({ input }) => {
    return await getMessagesByPageDesc(input.roomId, input.page, input.pageSize)
  }),
})
