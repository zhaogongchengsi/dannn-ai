import { z } from 'zod'
import { insertRoom } from '../../database/service/room'
import { publicProcedure, router } from '../trpc'

export const roomRouter = router({
  createRoom: publicProcedure.input(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      avatar: z.string().optional(),
    }),
  ).mutation(async ({ input }) => {
    return await insertRoom({
      title: input.title,
      description: input.description,
      avatar: input.avatar,
    })
  }),
})
