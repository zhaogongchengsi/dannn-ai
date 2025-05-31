import type { AiConfig } from '~/common/types'
import { and, eq } from 'drizzle-orm'
import { router } from '~/common/router'
import { db } from '../db'
import { ais } from '../schema'

export type InfoAI = typeof ais.$inferSelect

export async function findAiByName(name: string): Promise<InfoAI | undefined> {
  return db.select().from(ais).where(eq(ais.name, name)).get()
}

export function findAiById(id: number): Promise<InfoAI | undefined> {
  return db.select().from(ais).where(eq(ais.id, id)).get()
}

export async function findAiByCreateByAndName(createdBy: string, name: string): Promise<InfoAI | undefined> {
  return await db
    .select()
    .from(ais)
    .where(and(eq(ais.createdBy, createdBy), eq(ais.name, name)))
    .get()
}

export async function insertAi(config: AiConfig): Promise<InfoAI> {
  const info: InfoAI = {
    name: config.name,
    avatar: config.avatar || null,
    title: config.title,
    version: config.version,
    description: config.description ?? '',
    role: config.role ?? '',
    prompt: config.prompt ?? '',
    type: config.type || 'chat',
    models: config.models || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: 1,
    lastUsedAt: null,
    versionHistory: [config.version].join(','),
    tags: config.tags ? config.tags.join(',') : null,
    configuration: config.configuration ? JSON.stringify(config.configuration) : null,
    createdBy: config.createdBy || null,
    id: 0,
    author: config.author || null,
    deletedAt: null,
  }
  return await db.insert(ais).values(info).returning().get()
}

export async function updateAi(id: number, updates: Partial<AiConfig>): Promise<InfoAI | undefined> {
  const existingAi = await findAiById(id)
  if (!existingAi) {
    return undefined
  }

  const versionHistory = (existingAi.versionHistory ?? '').split(',')

  const updatedInfo: Partial<InfoAI> = {
    ...updates,
    updatedAt: new Date().toISOString(),
    tags: updates.tags ? updates.tags.join(',') : existingAi.tags,
    configuration: updates.configuration ? JSON.stringify(updates.configuration) : existingAi.configuration,
    versionHistory: [...versionHistory, updates.version].filter(Boolean).join(','),
  }

  return await db
    .update(ais)
    .set(updatedInfo)
    .where(eq(ais.id, id))
    .returning()
    .get()
}

export function getAllAis(): Promise<InfoAI[]> {
  return db.select().from(ais).all()
}

export const ai = router({
  findAiByCreateByAndName,
  findAiByName,
  findAiById,
  insertAi,
  updateAi,
  getAllAis,
})
