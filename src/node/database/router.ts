import type { ExtractRouterFunctions } from '~/common/bridge'
import { router } from '~/common/router'
import { ai } from './service/ai'
import { message } from './service/message'
import { room } from './service/room'

export const databaseRouter = router({
  room,
  message,
  ai,
})

export const extensionRouter = router({
  message,
  ai,
})

export type ExtensionDatabaseRouter = ExtractRouterFunctions<typeof extensionRouter>

// 自动生成 DatabaseRouter 类型
export type DatabaseRouter = ExtractRouterFunctions<typeof databaseRouter>
