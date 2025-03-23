import { describe, expect, it, vi } from 'vitest'
import { useDannn, withAsyncContext } from './context'
import { Hook } from './hook'

describe('withAsyncContext', () => {
  it('should execute the function within the provided context', async () => {
    const mockHook = new Hook()
    const instance = { hook: mockHook }
    const asyncFunction = vi.fn().mockResolvedValue(undefined)

    // @ts-ignore
    await withAsyncContext(instance, asyncFunction)

    expect(asyncFunction).toHaveBeenCalled()
  })

  it('should pass the correct context to the function', async () => {
    const mockHook = new Hook()
    const instance = { hook: mockHook }

    // @ts-ignore
    await withAsyncContext(instance, async () => {
      const context = useDannn()
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(context).toBe(instance)
      expect(context.hook).toBe(mockHook)
    })
  })

  it('should handle errors thrown by the asynchronous function', async () => {
    const mockHook = new Hook()
    const instance = { hook: mockHook }
    const asyncFunction = vi.fn().mockRejectedValue(new Error('Test error'))

    // @ts-ignore
    await expect(withAsyncContext(instance, asyncFunction)).rejects.toThrow('Test error')
  })
})
