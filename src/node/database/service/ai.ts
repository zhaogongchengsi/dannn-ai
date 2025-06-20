import type { CreateAIInput } from '~/common/schema'
import { and, eq } from 'drizzle-orm'
import { router } from '~/common/router'
import { db } from '../db'
import { ais } from '../schema'

export type InfoAI = typeof ais.$inferSelect

export type AIConfig = Omit<InfoAI, 'id' | 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'versionHistory' | 'deletedAt'>

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
    .where(and(eq(ais.author, createdBy), eq(ais.name, name)))
    .get()
}

export async function insertAi(config: AIConfig): Promise<InfoAI> {
  const info: Omit<InfoAI, 'id'> = {
    name: config.name,
    avatar: config.avatar || null,
    title: config.title,
    version: config.version,
    description: config.description ?? '',
    type: config.type || 'chat',
    models: config.models || '',
    isActive: 1,
    lastUsedAt: null,
    versionHistory: [config.version].join(','),
    tags: config.tags,
    author: config.author || null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return await db.insert(ais).values(info).returning().get()
}

export async function updateAi(id: number, updates: Partial<InfoAI>): Promise<InfoAI | undefined> {
  const existingAi = await findAiById(id)
  if (!existingAi) {
    return undefined
  }

  const versionHistory = (existingAi.versionHistory ?? '').split(',')

  const updatedInfo: Partial<InfoAI> = {
    ...updates,
    updatedAt: new Date().toISOString(),
    tags: updates.tags ? updates.tags : existingAi.tags,
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

export async function registerAi(config: CreateAIInput & { createdBy: string }) {
  if (!config.createdBy) {
    throw new Error('createdBy is required')
  }

  const exi = await findAiByCreateByAndName(config.createdBy, config.name)

  if (exi) {
    if (isVersionUpgraded(exi.version, config.version)) {
      // 版本升级，处理逻辑
      return (await updateAi(exi.id, {
        ...config,
        tags: config.tags ? config.tags.join(',') : exi.tags,
      }))!
    }
    return exi
  }

  return await insertAi({
    author: config.createdBy,
    avatar: config.avatar || null,
    description: config.description || null,
    type: config.type || 'chat',
    models: config.models || '',
    isActive: 1,
    tags: config.tags ? config.tags.join(',') : null,
    name: config.name,
    title: config.title,
    version: config.version,
  })
}

/**
 * 检查版本号是否升级
 * @param oldVersion 旧版本号
 * @param newVersion 新版本号
 * @returns 如果新版本号比旧版本号高，返回 true；否则返回 false
 */
function isVersionUpgraded(oldVersion: string, newVersion: string): boolean {
  const parseVersion = (version: string) => version.split('.').map(Number)

  const [oldMajor, oldMinor, oldPatch] = parseVersion(oldVersion)
  const [newMajor, newMinor, newPatch] = parseVersion(newVersion)

  if (newMajor > oldMajor)
    return true
  if (newMajor === oldMajor && newMinor > oldMinor)
    return true
  if (newMajor === oldMajor && newMinor === oldMinor && newPatch > oldPatch)
    return true

  return false
}

export const ai = router({
  findAiByCreateByAndName,
  findAiByName,
  findAiById,
  insertAi,
  updateAi,
  getAllAis,
  registerAi,
})
