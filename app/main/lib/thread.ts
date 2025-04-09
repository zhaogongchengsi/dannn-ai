import { Worker } from 'node:worker_threads'

export interface ThreadOptions {
  env: Record<string, string>
  workerData?: unknown
  cwd?: string
}

export function createThread<T>(workerPath: string, options?: ThreadOptions) {
  return new Promise<T>((resolve, reject) => {
    const worker = new Worker(workerPath, {
      workerData: options?.workerData,
      env: options?.env,
    })

    worker.once('message', (data) => {
      resolve(data as T)
    })

    worker.once('error', (error) => {
      reject(error)
    })

    worker.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}
