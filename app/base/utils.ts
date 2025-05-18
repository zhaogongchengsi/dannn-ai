import type { z } from 'zod'

export function formatZodError(error: z.ZodError) {
  return error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
    expected: issue.code === 'invalid_type'
      ? issue.expected
      : undefined,
    received: issue.code === 'invalid_type'
      ? issue.received
      : undefined,
  }))
}

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @param {string} [charset] - 可选字符集，默认包含大小写字母和数字
 * @returns {string} 随机字符串
 */
export function generateRandomString(length = 10, charset?: string): string {
  // 默认字符集（大小写字母+数字）
  const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // 使用传入的字符集或默认字符集
  const characters = charset || defaultCharset;
  let result = '';

  // 确保字符集不为空
  if (characters.length === 0) {
    throw new Error('字符集不能为空');
  }

  // 生成随机字符串
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}
