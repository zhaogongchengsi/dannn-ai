import type { DatabaseRouter } from '~/node/database/router'
import { rendererBridge } from './rpc'

export const database = rendererBridge.createProxy<DatabaseRouter>('database')
