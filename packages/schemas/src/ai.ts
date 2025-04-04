import { z } from 'zod'

export const aiConfig = z.object({
  name: z.string().describe('AI 名称'),
  title: z.string().optional().describe('AI 标题'),
  icon: z.string().optional().describe('AI 图标'),
  version: z.string().describe('AI 版本'),
  description: z.string().optional().describe('AI 介绍'),
  role: z.string().optional().describe('AI 角色'),
  prompt: z.string().optional().describe('AI 提示词'),
  type: z.enum(['text', 'image', 'audio', 'video']).describe('AI 类型'),
  models: z.array(z.string()).min(1).describe('支持的模型列表'),
})

export type AIConfig = z.infer<typeof aiConfig>
