import { z } from 'zod'

/**
 * 生成标准化插件ID
 * @param name 原始插件名称 (可能包含空格/特殊字符)
 * @param namespace 可选命名空间 (防止不同作者的同名插件冲突)
 * @returns 符合规范的插件ID (格式: [a-z0-9-]+)
 */
export function generatePluginId(name: string, namespace?: string): string {
  // 1. 输入验证
  const schema = z.string().min(1).max(100)
  schema.parse(name)
  if (namespace)
    schema.parse(namespace)

  // 2. 规范化处理
  const normalized = name
    .toLowerCase()
  // 替换连续非字母数字字符为单个连字符
    .replace(/[^a-z0-9]+/g, '-')
  // 移除首尾连字符
    .replace(/^-+|-+$/g, '')
  // 截断至合理长度
    .slice(0, 50)

  return normalized
}
