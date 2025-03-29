import type { formatZodError } from '../common/zod'

export class PluginValidationError extends Error {
  public readonly details: Array<{
    path: string
    message: string
    expected?: string
    received?: string
  }>

  constructor(
    message: string,
    details: ReturnType<typeof formatZodError> = [],
  ) {
    super(message)
    this.name = 'PluginValidationError'
    this.details = details
  }

  // 生成用户友好报告
  toUserReport() {
    return {
      title: '插件配置错误',
      sections: this.details.map(d => ({
        field: d.path || '根配置',
        problem: d.message,
        solution: d.expected
          ? `应提供 ${d.expected} 类型，但收到 ${d.received}`
          : '请检查配置格式',
      })),
    }
  }
}
