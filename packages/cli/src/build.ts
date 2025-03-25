import { builtinModules } from 'node:module'
import process from 'node:process'
import { build as esbuild } from 'esbuild'
import { readPackageJson } from './utils'

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

  return await esbuild({
    entryPoints: Array.isArray(entry) ? entry : [entry],
    outdir: dir || 'dist',
    bundle: true,
    platform: 'node',
    external: [
      ...builtinModules,
      ...builtinModules.map(module => `node:${module}`),
      'electron',
    ],
    loader: {
      ".png": 'file',
      '.tmpl': 'text',
      ".svg": 'file',
      ".json": 'json',
    },
    // minify: true,
    tsconfig: 'tsconfig.json',
    treeShaking: true,
    format: packageJson?.type === 'module' ? 'esm' : 'cjs',
    define,
  })
}
