import { cloneDeepWith, template } from 'lodash'

const interpolate = /\{\{([\s\S]+?)\}\}/g

/**
 * 深度克隆对象并编译模板变量
 * @param input 输入对象/数组
 * @param context 模板变量上下文
 * @returns 编译后的深拷贝对象
 */
export function compileWithTemplate<T extends object>(
  input: T,
  context: Record<string, any>,
): T {
  return cloneDeepWith(input, (value) => {
    // 仅处理字符串类型的值
    if (typeof value !== 'string')
      return undefined // 继续递归

    // 使用lodash的template编译
    const compiled = template(value, {
      interpolate,
      variable: 'ctx',
      imports: context, // 注入上下文变量
    })()

    // 返回编译结果（自动终止该分支的递归）
    return compiled
  })
}
