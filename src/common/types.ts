/**
 * 将指定的字段变为可选
 * @template T 原始接口
 * @template K 要变为可选的字段的键
 */
export type MakeFieldsOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
