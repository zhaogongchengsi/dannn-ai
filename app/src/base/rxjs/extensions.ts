import { getExtensionsRoot } from '@/lib/api'
import { join } from 'pathe'
import { Subject } from 'rxjs'
import { formatZodError } from '../common/zod'
import { extensionSchema } from '../schemas/extension'
import { ExtensionWorker } from '../worker/worker'
import { APP_EXTENSION_CONFIG_NAME } from './constant'

const workers: Map<string, ExtensionWorker> = new Map()
export const extensionWorkerSubject = new Subject<ExtensionWorker>()

export function getExtensionWorker(id: string) {
  return workers.get(id)
}

export function getExtensionWorkers() {
  return Array.from(workers.values())
}

export function onExtensionLoaded(callback: (worker: ExtensionWorker) => void) {
  return extensionWorkerSubject.subscribe(callback)
}

export function removeExtensionWorker(id: string) {
  const worker = workers.get(id)
  if (worker) {
    worker.destroy()
    workers.delete(id)
  }
}

export function extensionDestroy() {
  workers.forEach((worker) => {
    worker.destroy()
  })
  workers.clear()
  extensionWorkerSubject.complete()
}

export async function loadLocalExtensions() {
  const root = await getExtensionsRoot()
  const extensions = await window.dannn.readDir(root)

  extensions.forEach(async (extension) => {
    try {
      const pluginDir = join(root, extension)
      const configPath = join(pluginDir, APP_EXTENSION_CONFIG_NAME)

      if (!await window.dannn.exists(configPath)) {
        return
      }

      const config = await window.dannn.readFile(configPath).catch(() => {
        return undefined
      })

      if (!config) {
        return
      }

      const { success, data, error } = extensionSchema.safeParse(JSON.parse(config))

      if (!success) {
        console.error('Invalid extension config:', formatZodError(error))
        return
      }

      const extensionWorker = new ExtensionWorker(data, { pluginDir, dirname: extension })
      workers.set(extensionWorker.id, extensionWorker)
      extensionWorkerSubject.next(extensionWorker)
    }
    catch (error) {
      console.error('Error loading extension:', error)
    }
  })
}
