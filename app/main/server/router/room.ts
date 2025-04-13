import { z } from 'zod'
import { addAiToRoom, getAllRooms, insertRoom } from '../../database/service/room'
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
  getAllRooms: publicProcedure.query(async () => {
    return await getAllRooms()
  }),
  addAiToRoom: publicProcedure.input(
    z.object({
      roomId: z.number(),
      aiId: z.number(),
    }),
  ).mutation(async ({ input }) => {
    // Assuming there is a function to handle adding AI to a room
    return await addAiToRoom(input.roomId, input.aiId)
  }),
})
