import type { Extension } from './type'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { resolvePackageJSON } from 'pkg-types'
import { bootstrap } from './bootstrap'
import { rpc } from './ipc'

if (!process.env.DANNN_PROCESS_PATH || !process.env.DANNN_PROCESS_PATH) {
  throw new Error('DANNN_PROCESS_PATH is not defined')
}

async function init() {
  const pkgPath = await resolvePackageJSON(process.env.DANNN_PROCESS_PATH)

  if (!pkgPath) {
    return Promise.reject(new Error('Package JSON not found'))
  }

  const contents = await readFile(pkgPath, { encoding: 'utf8' })

  const pkg = JSON.parse(contents)

  if (!pkg) {
    return Promise.reject(new Error('Package JSON is empty or invalid'))
  }

  if (!pkg.main) {
    return Promise.reject(new Error('Package JSON does not have a main entry'))
  }

  const path = join(process.env.DANNN_PROCESS_PATH!, pkg.main)

  if (!existsSync(path)) {
    return Promise.reject(new Error(`Main file ${path} does not exist`))
  }

  if (!path) {
    return Promise.reject(new Error('Path to the extension is not defined'))
  }

  const modulePath = pathToFileURL(path).href

  import(modulePath)
    .then((module: Extension) => {
      bootstrap(module)
    })
    .catch((err: any) => {
      console.error('Error loading extension:', err)
      rpc.emit('extension.error', err?.message)
      process.exit(1)
    })
}

init()
  .catch((err: any) => {
    console.error('Error in extension loader:', err)
    rpc.emit('_extension.error', err?.message)
    process.exit(1)
  })
