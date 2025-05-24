import { readdir } from 'node:fs/promises'
import { join } from 'pathe'
import { EXTENSIONS_ROOT } from './constant'
import { ExtensionProcess } from './lib/extension'

export async function extensionLoadAll(port: number) {
  const processes = []

  try {
    const dirs = await readdir(EXTENSIONS_ROOT)

    for (const dir of dirs) {
      const eProcess = new ExtensionProcess(join(EXTENSIONS_ROOT, dir), {
        env: {
          PORT: String(port),
        },
      })
      try {
        await eProcess.start()
        processes.push(eProcess)
      }
      catch (err) {
        console.error(`Failed to load extension ${dir}`, err)
      }
    }
  }
  catch (err: any) {
    console.error(`Failed to load extensions`, err)
  }

  return processes
}
