import type { AIData } from '~/common/types'
import { z } from 'zod'
import { updateAIMessageContextFalse, updateAIMessageContextTrue } from '~/node/database/service/message'
import { addAiToRoom, getAllRooms, getRoomById, getRoomContextMessages, getRoomParticipants, insertRoom } from '~/node/database/service/room'
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
  getRoomParticipants: publicProcedure.input(
    z.number(),
  ).query(async ({ input }): Promise<AIData[]> => {
    return await getRoomParticipants(input)
  }),
  getRoomContextMessages: publicProcedure.input(z.object({
    roomId: z.number(),
  })).query(async ({ input }) => {
    const roomId = input.roomId
    return await getRoomContextMessages(roomId)
  }),
  getRoomById: publicProcedure.input(z.object({
    roomId: z.number(),
  })).query(async ({ input }) => {
    return await getRoomById(input.roomId)
  }),
  updateAIMessageContextTrue: publicProcedure.input(z.object({
    messageId: z.string(),
  })).mutation(async ({ input }) => {
    // Assuming there is a function to handle updating AI message context
    return await updateAIMessageContextTrue(input.messageId)
  }),
  updateAIMessageContextFalse: publicProcedure.input(z.object({
    messageId: z.string(),
  })).mutation(async ({ input }) => {
    // Assuming there is a function to handle updating AI message context
    return await updateAIMessageContextFalse(input.messageId)
  }),
})
