import { aiRouter } from './router/ai'
import { roomRouter } from './router/room'
import { router } from './trpc'

export const appRouter = router({
  room: roomRouter,
  ai: aiRouter
})

export type AppRouter = typeof appRouter
