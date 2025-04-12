import { builtinModules } from 'node:module'
import process from 'node:process'
import { build as esbuild } from 'esbuild'
import { readPackageJson } from './utils'
import consola from 'consola'

export interface BuildOptions {
  /**
   * The entry file or files
   */
  entry: string | string[]
  /**
   * The output directory
   */
  dir?: string
  mode?: string
}

export async function build({ entry, dir, mode }: BuildOptions) {
  const packageJson = readPackageJson(process.cwd())

  const define = {
    ...mode ? { 'process.env.MODE': JSON.stringify(mode), MODE: JSON.stringify(mode) } : {},
  }

  const dependencies = Object.keys(packageJson?.dependencies || {})

  const dannnExternal = packageJson?.dannn?.build?.external || dependencies

  const nativeDep = [
    ...builtinModules,
    ...builtinModules.map(module => `node:${module}`),
    'electron',
  ]

  const external = Array.from(
    new Set([
      ...nativeDep,
      ...dannnExternal,
    ])
  )

  await esbuild({
    entryPoints: Array.isArray(entry) ? entry : [entry],
    outdir: dir || 'dist',
    bundle: true,
    platform: 'node',
    external,
    loader: {
      ".png": 'file',
      '.tmpl': 'text',
      ".svg": 'text',
      ".json": 'json',
    },
    outExtension: {
      '.js': packageJson?.type === 'module' ? '.mjs' : '.cjs', // 将输出的 `.js` 文件改为 `.mjs`
    },
    // minify: true,
    tsconfig: 'tsconfig.json',
    treeShaking: true,
    format: packageJson?.type === 'module' ? 'esm' : 'cjs',
    define,
  })
}
