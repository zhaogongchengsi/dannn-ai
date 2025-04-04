import type { Table } from 'dexie'
import type { AIChat, AIMessage, AIModel } from './models'
import Dexie from 'dexie'
import { tableSchemasV1 } from './tables'

/**
 * Dexie 数据库定义
 */
export class Database extends Dexie {
  aiModels!: Table<AIModel, string>
  aiChats!: Table<AIChat, string>
  aiMessages!: Table<AIMessage, string>

  constructor() {
    super('dannn-db')

    // 初始数据库结构
    this.version(1).stores(tableSchemasV1)
  }
}

// 创建数据库实例
export const database = new Database()
