import type { AIConfig } from '@/lib/schemas/ai'
import type { Extension } from '@/lib/schemas/extension'
import type { ReplaySubject } from 'rxjs/internal/ReplaySubject'

export interface ActiveExtension extends Extension {
  id: string
  subject: ReplaySubject<ExtensionEvent>
  status: 'loading' | 'active' | 'error'
  lastUpdated: number
}

export interface AIConfigUpdate {
  target: {
    extensionId: string
    aiName: string // 对应 aiConfig 中的 name 字段
  }
  changes: Partial<AIConfig> // 允许部分更新
  timestamp: number
  origin?: 'user' | 'system' | 'plugin' // 更新来源
}

export interface ExtensionEvent {
  type: 'config-update' | 'ai-status-change'
  payload: Partial<Extension> | AIConfigUpdate
}
