import { aiRouter } from './router/ai'
import { messageRouter } from './router/message'
import { roomRouter } from './router/room'
import { router } from './trpc'

export const appRouter = router({
  room: roomRouter,
  ai: aiRouter,
  message: messageRouter,
})

export type AppRouter = typeof appRouter
