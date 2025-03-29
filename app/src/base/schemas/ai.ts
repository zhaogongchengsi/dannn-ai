import { z } from 'zod'

export const aiConfig = z.object({
  name: z.string().describe('AI 名称'),
  description: z.string().optional().describe('AI 介绍'),
  role: z.string().optional().describe('AI 角色'),
  prompt: z.string().optional().describe('AI 提示词'),
  type: z.enum(['text', 'image', 'audio', 'video']).describe('AI 类型'),
  models: z.array(z.string()).min(1).describe('支持的模型列表'),
  temperature: z.number().min(0).max(1).optional().describe('生成文本的随机性'),
  maxTokens: z.number().int().min(1).optional().describe('最大 Token 数'),
  topP: z.number().min(0).max(1).optional().describe('采样概率'),
  frequencyPenalty: z.number().optional().describe('频率惩罚'),
  presencePenalty: z.number().optional().describe('话题惩罚'),
  apiBaseurl: z.string().describe('AI API 端点'),
  apiKey: z.string().describe('API Key'),
  functionCalls: z
    .array(
      z.object({
        name: z.string().describe('函数名'),
        description: z.string().optional().describe('函数描述'),
        parameters: z.record(z.any()).describe('函数参数（JSON Schema 格式）'),
        required: z.boolean().optional().describe('该函数是否必须调用'),
      }),
    )
    .optional()
    .describe('AI 可调用的函数定义'),
})

export type AIConfig = z.infer<typeof aiConfig>
