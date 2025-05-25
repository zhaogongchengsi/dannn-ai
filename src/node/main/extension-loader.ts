import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { resolvePackageJSON } from 'pkg-types'
import { Ipc } from './extension/ipc'

if (!process.env.DANNN_PROCESS_PATH || !process.env.DANNN_PROCESS_PATH) {
  throw new Error('DANNN_PROCESS_PATH is not defined')
}

;(async () => {
  const pkgPath = await resolvePackageJSON(process.env.DANNN_PROCESS_PATH)

  if (!pkgPath) {
    throw new Error('Package not found')
  }

  const contents = await readFile(pkgPath, { encoding: 'utf8' })

  const pkg = JSON.parse(contents)

  if (!pkg) {
    throw new Error('Package is not valid')
  }

  if (!pkg.main) {
    throw new Error('Package main is not defined')
  }

  const path = join(process.env.DANNN_PROCESS_PATH!, pkg.main)

  import(pathToFileURL(path).href)
    .then((module) => {
      const ipc = new Ipc()
      if (module || typeof module.activate !== 'function') {
        module.activate()
      }

      ipc.invoke('hello')
        .then((result) => {
          console.log('Result from extension:', result)
        })
        .catch((err) => {
          console.error('Error invoking hello:', err)
        })
    })
    .catch((err) => {
      console.error('Error loading module:', err)
    })
})()
