import type { DatabaseRouter } from '~/node/database/router'

const rpc = new Rpc()

export const database = rpc.rpc.createProxy<DatabaseRouter>('database')
