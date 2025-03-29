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
