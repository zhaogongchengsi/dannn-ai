import { builtinModules } from 'node:module'
import process from 'node:process'
import { build as esbuild } from 'esbuild'
import { readPackageJson } from './utils'
import { isAbsolute, resolve, normalize } from 'pathe'
import consola from 'consola'
import { colors } from 'consola/utils'

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
  const startTime = performance.now(); // 开始计时

  const packageJson = readPackageJson(process.cwd())

  const define = {
    ...mode ? { 'process.env.MODE': JSON.stringify(mode), MODE: JSON.stringify(mode) } : {},
  }

  const dependencies = Object.keys(packageJson?.dependencies || {})
  const dannnExternal = packageJson?.dannn?.build?.external || dependencies
  const dannnEntries = packageJson?.dannn?.build?.entries

  const aliasInput = packageJson?.dannn?.build?.alias || {}
  const outdir = packageJson?.dannn?.build?.outdir || dir || 'dist'

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

  const alias = Object.fromEntries(
    Object.entries(aliasInput)
      .map(([key, value]) => {
        const path = isAbsolute(value) ? value : resolve(process.cwd(), value)
        return [key, normalize(path)]
    })
  )

  const entries = dannnEntries ? Array.isArray(dannnEntries) ? dannnEntries : [dannnEntries] : []

  const entryPoints = [
    ...entries,
    ...Array.isArray(entry) ? entry : [entry],
  ]

  consola.info(`Building ${
    entryPoints.map((entry) => {
      return colors.cyan(entry)
    })
    .join(', \n')} ...`
  )

  const result = await esbuild({
    entryPoints,
    outdir,
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
    alias,
    // minify: true,
    tsconfig: 'tsconfig.json',
    treeShaking: true,
    format: packageJson?.type === 'module' ? 'esm' : 'cjs',
    define,
    metafile: true,
  })

  const endTime = performance.now(); // 结束计时
  const duration = (endTime - startTime).toFixed(2);

  const outputs = Object.keys(result?.metafile?.outputs ?? {});
  consola.success(
    `Build completed in ${colors.cyan(`${duration} ms`)}. Output files:`
  );
  outputs.forEach((output) => consola.log(`${colors.green(output)}`));
}
