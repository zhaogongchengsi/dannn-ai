import type { Logger } from '../../shared/logger'

export interface ServerConfig {
  port: number
  host: string
  logger?: Logger
}
