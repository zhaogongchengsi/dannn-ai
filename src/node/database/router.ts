import { router } from '~/common/router'
import { ai } from './service/ai'
import { message } from './service/message'
import { room } from './service/room'

export const databaseRouter = router({
  room,
  message,
  ai,
})
