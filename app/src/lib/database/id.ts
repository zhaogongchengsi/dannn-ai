import type { ID } from './models'

/**
 * 生成 UUID
 */
export function generateUUID(): ID {
  return crypto.randomUUID() // 现代浏览器和 Node.js 均支持
}
