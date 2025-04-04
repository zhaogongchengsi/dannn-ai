import { z } from 'zod'

export const WorkerMessageType = z.enum([
	/**
	 * * 发送给主线程的消息 用于调用主线程提供的函数
	 */
	'call-function',
	'call-function-response',
	'call-function-error',
	'event-emit',
	'done'
])

export const WorkerCallFunctionMessage = z.object({
	id: z.string(),
	type: z.literal('call-function'),
	data: z.object({
		name: z.string(),
		args: z.array(z.any()),
	}),
})

export const WorkerCallFunctionResponseMessage = z.object({
	id: z.string(),
	type: z.literal('call-function-response'),
	data: z.object({
		result: z.any(),
	}),
})

export const WorkerCallFunctionErrorMessage = z.object({
	id: z.string(),
	type: z.literal('call-function-error'),
	data: z.object({
		error: z.string(),
	}),
})

export const WorkerEventEmitMessage = z.object({
	type: z.literal('event-emit'),
	data: z.object({
		name: z.string(),
		event: z.any(),
	}),
})

export const WorkerDoneMessage = z.object({
	type: z.literal('done'),
})

export type WorkerMessageType = z.infer<typeof WorkerMessageType>
export type WorkerCallFunctionMessage = z.infer<typeof WorkerCallFunctionMessage>
export type WorkerCallFunctionResponseMessage = z.infer<typeof WorkerCallFunctionResponseMessage>
export type WorkerCallFunctionErrorMessage = z.infer<typeof WorkerCallFunctionErrorMessage>
export type WorkerEventEmitMessage = z.infer<typeof WorkerEventEmitMessage>
export type WorkerDoneMessage = z.infer<typeof WorkerDoneMessage>
export type WorkerMessage =
	WorkerCallFunctionMessage |
	WorkerCallFunctionResponseMessage |
	WorkerCallFunctionErrorMessage |
	WorkerEventEmitMessage |
	WorkerDoneMessage
export type WorkerMessageData =
	WorkerCallFunctionMessage['data'] |
	WorkerCallFunctionResponseMessage['data'] |
	WorkerCallFunctionErrorMessage['data'] |
	WorkerEventEmitMessage['data']
