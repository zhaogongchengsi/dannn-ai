import { z } from 'zod'
import { aiConfig } from './ai'

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
  license: z.string().optional().describe('扩展许可证'),
  aiCollection: z.array(aiConfig)
    .optional()
    .describe('AI 集合'),
})

export type Extension = z.infer<typeof extensionSchema>

export interface ExtensionMeta extends Extension {
  readme?: string
  writable?: boolean
  available?: boolean
}
