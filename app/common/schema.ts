import { z } from 'zod'

export const createAIInput = z.object({
  name: z.string().regex(/^[^\s!@#$%^&*()+=[\]{};':"\\|,.<>/?]*$/, { message: 'Name cannot contain illegal characters or spaces' }),
  title: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, { message: 'Version must follow the semantic versioning format (e.g., 1.0.0)' }),
  description: z.string().optional(),
  avatar: z.string().optional(),
  prompt: z.string().optional(),
  role: z.string().optional(),
  type: z.string().optional(),
  models: z.string().optional(),
  tags: z.array(z.string()).optional(),
  configuration: z.record(z.any()).optional(),
  createdBy: z.string(),
})

export type CreateAIInput = z.infer<typeof createAIInput>
