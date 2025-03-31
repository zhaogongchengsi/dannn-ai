import { z } from 'zod'

const extensionPermissions = z.object({
  env: z.array(z.string()).optional().describe('环境变量 Key 列表'),
})

export type ExtensionPermissions = z.infer<typeof extensionPermissions>

// 定义主 Schema
export const extensionSchema = z.object({
  name: z.string().describe('扩展名称'),
  version: z.string().describe('扩展版本'),
  main: z.string().describe('扩展的入口文件路径'),

  icon: z.string().url().optional().describe('扩展图标 URL'),
  description: z.string().optional().describe('扩展描述'),
  author: z.string().optional().describe('扩展作者'),
  homepage: z.string().url().optional().describe('扩展主页 URL'),
  permissions: extensionPermissions.optional().describe('扩展权限'),
  license: z.string().optional().describe('扩展许可证'),
})

export type Extension = z.infer<typeof extensionSchema>
