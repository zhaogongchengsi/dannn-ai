import type { Config } from './config'
import type { Hook } from './hook'
import type { Loader } from './loader'
import type { Window } from './window'
import { AsyncLocalStorage } from 'node:async_hooks'
import { createContext } from 'unctx'

export interface DannnContext {
  hook: Hook
  window?: Window
  loader: Loader
  config: Config
}

const ctx = createContext<DannnContext>({
  asyncContext: true,
  AsyncLocalStorage,
})

export const useDannn = ctx.use

/**
 * Executes a given asynchronous function within the context of a specified `DannnContext` instance.
 *
 * @param instance - The `DannnContext` instance within which the asynchronous function will be executed.
 * @param fn - The asynchronous function to be executed.
 * @returns A promise that resolves when the asynchronous function completes.
 */
export function withAsyncContext(instance: DannnContext, fn: () => Promise<void>) {
  return ctx.callAsync(instance, fn)
}
