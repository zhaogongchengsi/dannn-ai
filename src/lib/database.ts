import type { DatabaseRouter } from "~/node/database/router"

const rpc = new Rpc()

export const database = rpc.createProxy<DatabaseRouter>('database')

// 获取 Promise 里的实际类型
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

export type GetDataRpcReturnType<
	T extends keyof DatabaseRouter,
	M extends keyof DatabaseRouter[T] & (string | number | symbol)
> = DatabaseRouter[T][M] extends (...args: any) => any
	? UnwrapPromise<ReturnType<DatabaseRouter[T][M]>>
	: never