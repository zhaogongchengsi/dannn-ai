// TODO: This file is a temporary workaround for the issue with loading ESM modules in Electron.

import type Buffer from 'node:buffer'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

interface ResolveContext {
  conditions: string[]
  parentURL?: string
}

interface LoadContext {
  format?: string
}

type DefaultResolve = (
  specifier: string,
  context: ResolveContext,
  defaultResolve: DefaultResolve
) => Promise<{ url: string }>

type DefaultLoad = (
  url: string,
  context: LoadContext,
  defaultLoad: DefaultLoad
) => Promise<{ format: string, source: string | Buffer }>

const dannnModulesPath
  = process.env.DANNN_MODULES_PATH
    || path.resolve(process.execPath, '..', 'node_modules')

export async function resolve(specifier: string, context: ResolveContext, defaultResolve: DefaultResolve) {
  if (specifier.startsWith('dannn:')) {
    const moduleName = specifier.replace(/^dannn:/, '')

    // 构造真实物理路径（如 dannn:ai -> /.../node_modules/ai）
    const physicalPath = path.join(dannnModulesPath, moduleName)

    // 使用 pathToFileURL 变成 URL 传入 nextResolve
    const rewrittenSpecifier = pathToFileURL(physicalPath).href

    // 👇 把改写后的路径交给 Node 继续解析（支持 main/exports/type 等）
    return defaultResolve(rewrittenSpecifier, context, defaultResolve)
  }

  return defaultResolve(specifier, context, defaultResolve)
}

// export async function load(url: string, context: LoadContext, defaultLoad: DefaultLoad) {
//   console.log(`Loading: ${url}`)
//   return defaultLoad(url, context, defaultLoad)
// }
