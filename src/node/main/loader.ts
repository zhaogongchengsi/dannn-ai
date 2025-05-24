// TODO: This file is a temporary workaround for the issue with loading ESM modules in Electron.

import type Buffer from 'node:buffer'

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

export async function resolve(specifier: string, context: ResolveContext, defaultResolve: DefaultResolve) {
  return defaultResolve(specifier, context, defaultResolve)
}

// export async function load(url: string, context: LoadContext, defaultLoad: DefaultLoad) {
//   console.log(`Loading: ${url}`)
//   return defaultLoad(url, context, defaultLoad)
// }
