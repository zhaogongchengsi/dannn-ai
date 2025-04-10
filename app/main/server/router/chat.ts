import { z } from 'zod'
import { insertChat } from '../../database/service/chat'
import { publicProcedure, router } from '../trpc'

export const chatRouter = router({
  createChat: publicProcedure.input(
    z.object({
      title: z.string(),
      description: z.string(),
      avatar: z.string(),
    }),
  ).mutation(async ({ input }) => {
    return await insertChat(input)
  }),
})
