import { eq } from 'drizzle-orm'
import { db } from '../db'
import { envs } from '../schema'

export async function getEnv(name: string) {
  const value = await db
    .select()
    .from(envs)
    .where(eq(envs.key, name))
    .get()

  return value ? value.value : null
}

export async function setEnv(name: string, value: string) {
  const exist = await getEnv(name)
  if (exist) {
    return db
      .update(envs)
      .set({ value, updatedAt: new Date().toISOString() })
      .where(eq(envs.key, name))
      .returning()
      .get()
  }
  else {
    return db
      .insert(envs)
      .values({ key: name, value, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .returning()
      .get()
  }
}
