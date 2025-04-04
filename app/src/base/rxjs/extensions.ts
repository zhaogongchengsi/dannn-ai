import type { AIModel } from '@/lib/database/models'
import { getExtensionsRoot } from '@/lib/api'
import { extensionSchema } from '@dannn/schemas'
import { join } from 'pathe'
import { ReplaySubject, Subject } from 'rxjs'
import { formatZodError } from '../common/zod'
import { ExtensionWorker } from '../worker/worker'
import { onToWorkerChannel } from './channel'
import { APP_EXTENSION_CONFIG_NAME } from './constant'

const workers: Map<string, ExtensionWorker> = new Map()
const activeExtensionAi = new ReplaySubject<boolean>(1)
export const activeExtension$ = new ReplaySubject<boolean>(1)
export const extensionWorkerSubject = new Subject<ExtensionWorker>()
export const extensionAiSubject = new Subject<AIModel>()

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

export function setActiveExtension() {
  activeExtensionAi.next(true)
}

export function onAIRegistered(callback: (ai: AIModel) => void) {
  return extensionAiSubject.subscribe(callback)
}

export async function loadLocalExtensions() {
  const root = await getExtensionsRoot()
  const extensions = await window.dannn.readDir(root)

  for (const extension of extensions) {
    try {
      const pluginDir = join(root, extension)
      const configPath = join(pluginDir, APP_EXTENSION_CONFIG_NAME)

      if (!await window.dannn.exists(configPath)) {
        console.warn('Extension config not found:', configPath)
        continue
      }

      const config = await window.dannn.readFile(configPath).catch(() => {
        return undefined
      })

      if (!config) {
        console.warn('Extension config is empty:', configPath)
        continue
      }

      const { success, data, error } = extensionSchema.safeParse(JSON.parse(config))

      if (!success) {
        console.error('Invalid extension config:', formatZodError(error))
        return
      }

      const extensionWorker = new ExtensionWorker(data, { pluginDir, dirname: extension })
      workers.set(extensionWorker.id, extensionWorker)
      extensionWorkerSubject.next(extensionWorker)
      activeExtensionAi.subscribe((active) => {
        if (active) {
          extensionWorker.activate()
        }
      })
      extensionWorker.on('register-ai', (ai) => {
        extensionAiSubject.next(ai)
      })
    }
    catch (error) {
      console.error('Error loading extension:', error)
    }
  }

  activeExtension$.next(true)
}

onToWorkerChannel((message) => {
  message.aiReplier.forEach((id) => {
    workers.forEach((worker) => {
      worker.includesAI(id) && worker.sendToWorkerChannel(message)
    })
  })
})
