import { router } from '~/common/router'
import { ai } from './service/ai'
import { message } from './service/message'
import { room } from './service/room'

export const databaseRouter = router({
  room,
  message,
  ai,
})


// 类型工具：只保留函数类型的导出
type OnlyFunctions<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K]
}

// 自动生成 DatabaseRouter 类型
export type DatabaseRouter = {
  [K in keyof typeof databaseRouter]: OnlyFunctions<typeof databaseRouter[K]>
}