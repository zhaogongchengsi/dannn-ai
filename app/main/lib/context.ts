import { createContext } from "unctx";
import { AsyncLocalStorage } from "node:async_hooks";
import { Hook } from "./hook";

export interface DannnContext {
	hook: Hook
}

const ctx = createContext<DannnContext>({
	asyncContext: true,
	AsyncLocalStorage,
});

export const useDannn = ctx.use

/**
 * Executes a given asynchronous function within the context of a specified `DannnContext` instance.
 *
 * @param instance - The `DannnContext` instance within which the asynchronous function will be executed.
 * @param fn - The asynchronous function to be executed.
 * @returns A promise that resolves when the asynchronous function completes.
 */
export function withAsyncContext(instance: DannnContext ,fn: () => Promise<void>) {
	return ctx.callAsync(instance, fn);
}