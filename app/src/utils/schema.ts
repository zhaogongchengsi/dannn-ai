import { z } from 'zod'

const aiCollectionSchema = z.object({
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
  apiEndpoint: z.string().optional().describe('AI API 端点'),
  apiKey: z.string().optional().describe('API Key'),
  customParams: z.record(z.any()).optional().describe('额外自定义参数'),
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

const extensionPermission = z.object({
  env: z.array(z.string()).optional().describe('环境变量 Key 列表'),
})

// 定义主 Schema
export const extensionSchema = z.object({
  name: z.string().describe('扩展名称'),
  version: z.string().describe('扩展版本'),
  icon: z.string().url().optional().describe('扩展图标 URL'),
  description: z.string().optional().describe('扩展描述'),
  author: z.string().optional().describe('扩展作者'),
  homepage: z.string().url().optional().describe('扩展主页 URL'),
  main: z.string().optional().describe('扩展的入口文件路径'),
  permission: extensionPermission.optional().describe('扩展权限'),
  aiCollection: z.array(aiCollectionSchema)
    .optional()
    .describe('AI 集合'),
})
