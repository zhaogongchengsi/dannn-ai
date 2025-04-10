import { initTRPC } from '@trpc/server'

const t = initTRPC.create() // 创建 tRPC 实例

// 定义 appRouter，包含多个 API 路由
export const appRouter = t.router({
  // hello 路由，返回一个简单的问候信息
  hello: t.procedure.query(() => {
    return { message: 'Hello from tRPC!' }
  }),
})

export type AppRouter = typeof appRouter
