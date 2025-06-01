import { z } from 'zod'

export const createAIInput = z.object({
  name: z.string().regex(/^[^\s!@#$%^&*()+=[\]{};':"\\|,.<>/?]*$/, { message: 'Name cannot contain illegal characters or spaces' }),
  title: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, { message: 'Version must follow the semantic versioning format (e.g., 1.0.0)' }),
  description: z.string().optional(),
  avatar: z.string().optional(),
  prompt: z.string().optional(),
  role: z.string().optional(),
  type: z.string().optional(),
  models: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateAIInput = z.infer<typeof createAIInput>

export const questionContext = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
})

export const question = z.object({
  /**
   * @description 这个问题的内容
   * @example "What is the capital of France?"
   */
  content: z.string(),

  /**
   * @description 这个问题的类型，可以是文本、图片、音频、视频或文件
   * @example "text"
   * @default "text"
   */

  type: z.enum(['text', 'image', 'audio', 'video', 'file']).optional().default('text'),
  /**
   * @description 这个问题是从哪个房间发出来的
   * @example 123
   */
  roomId: z.number(),

  /**
   * @description 这个问题的引用，可以是另一个问题的 ID 或其他相关信息
   */
  reference: z.string().optional(),

  /**
   * @description 需要哪些 AI 回答这个问题，AI 的 ID 列表
   * @example [1, 2, 3]
   */
  aiIds: z.array(z.number()).default([]),

  context: z.array(questionContext).optional().default([]),
})

export const answer = z.object({
  content: z.string(),
  type: z.enum(['text', 'image', 'audio', 'video', 'file']),
  roomId: z.number(),
  reference: z.string().optional(),
  functionResponse: z.string().optional(),
  aiId: z.number(),
  isStreaming: z.boolean().optional(),
  streamGroupId: z.string().optional(),
  streamIndex: z.number().optional(),
})

export type QuestionContext = z.infer<typeof questionContext>
export type Question = z.infer<typeof question>
export type Answer = z.infer<typeof answer>
