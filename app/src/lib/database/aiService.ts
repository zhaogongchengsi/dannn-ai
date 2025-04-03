import type { AIConfig } from '@dannn/schemas'
import type { AIModel, ID } from './models'
import { database } from './database'
import { generateUUID } from './id'

/**
 * 根据名称查找 AI
 * @param name AI 名称
 * @returns 返回匹配的 AI 对象或 null
 */
export async function findAIByName(name: string): Promise<AIModel | null> {
  const ai = await database.aiModels.where('name').equals(name).first()
  return ai || null
}

/**
 * 更新 AI 配置
 * @param id AI ID
 * @param updates 更新的配置
 * @returns 返回更新后的 AI 对象
 */
export async function updateAIConfig(id: ID, updates: Partial<AIConfig>): Promise<AIModel | null> {
  const ai = await database.aiModels.get(id)
  if (!ai) {
    return null
  }

  const updatedAI: AIModel = {
    ...ai,
    ...updates,
    updateAt: Date.now(),
  }

  await database.aiModels.put(updatedAI)

  return updatedAI
}

/**
 * 查找所有 AI
 * @returns 返回所有 AI 对象的数组
 */
export async function findAllAIs(): Promise<AIModel[]> {
  const ais = await database.aiModels.toArray()
  return ais
}

/**
 * 注册一个新的 AI
 * @param ai AI 配置
 * @returns 返回存入数据库的 AI 对象
 */
export async function registerAI(ai: AIConfig): Promise<AIModel> {
  // 检查是否已存在相同 ID 的 AI 并且版本一致 则忽略
  const existingAI = await findAIByName(ai.name)
  if (existingAI) {
    if (existingAI.version === ai.version) {
      return existingAI
    }
    else {
      return (await updateAIConfig(existingAI.id, ai))!
    }
  }

  // 生成 AI ID
  const id = generateUUID()
  // 处理默认值
  const newAI: AIModel = {
    id,
    name: ai.name || '未命名 AI',
    description: ai.description || '',
    version: ai.version,
    type: ai.type ?? 'text',
    apiKey: ai.apiKey || '',
    apiBaseURL: ai.apiBaseURL || '',
    models: ai.models, // 默认支持 GPT-4
    module: ai.models?.[0], // 默认选第一个模型
    temperature: ai.temperature ?? 0.7,
    maxTokens: ai.maxTokens ?? 4096,
    topP: ai.topP ?? 1,
    presencePenalty: ai.presencePenalty ?? 0,
    frequencyPenalty: ai.frequencyPenalty ?? 0,
    prompt: ai.prompt || '',
    createdAt: Date.now(),
    updateAt: Date.now(),
    isDeleted: false,
  }

  // 存入数据库
  await database.aiModels.add(newAI)

  return newAI
}
