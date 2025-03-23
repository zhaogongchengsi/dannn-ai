import { describe, it, expect, vi } from 'vitest';
import { withAsyncContext, useDannn } from './context';
import { Hook } from './hook';

describe('withAsyncContext', () => {
	it('should execute the function within the provided context', async () => {
		const mockHook = new Hook();
		const instance = { hook: mockHook };
		const asyncFunction = vi.fn().mockResolvedValue(undefined);

		await withAsyncContext(instance, asyncFunction);

		expect(asyncFunction).toHaveBeenCalled();
	});

	it('should pass the correct context to the function', async () => {
		const mockHook = new Hook();
		const instance = { hook: mockHook };

		await withAsyncContext(instance, async () => {
			const context = useDannn();
			await new Promise((resolve) => setTimeout(resolve, 100));
			expect(context).toBe(instance);
			expect(context.hook).toBe(mockHook);
		});
	});

	it('should handle errors thrown by the asynchronous function', async () => {
		const mockHook = new Hook();
		const instance = { hook: mockHook };
		const asyncFunction = vi.fn().mockRejectedValue(new Error('Test error'));

		await expect(withAsyncContext(instance, asyncFunction)).rejects.toThrow('Test error');
	});
});