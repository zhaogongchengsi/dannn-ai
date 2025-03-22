import process from 'node:process'
import { defineCommand } from 'citty'
import { consola } from 'consola'
import { build } from '../build'
import { readPackageJson } from '../utils'

export default defineCommand({
  meta: {
    name: 'build',
    description: 'Build the project',
  },
  args: {
    input: {
      type: 'string',
      description: 'The entry file or files',
      required: true,
      alias: 'i',
    },
    dir: {
      type: 'string',
      description: 'The output directory',
      alias: 'd',
    },
    mode: {
      type: 'string',
      description: 'The mode to build the project',
      alias: 'm',
      default: 'production',
    },
  },
  async run({ args }) {
    const input = args.input
    const dir = args.dir || 'dist'
    const mode = args.mode
    const entry = input.split(',').map(i => i.trim()).filter(Boolean)

    const packageJson = readPackageJson(process.cwd())

    if (!packageJson) {
      consola.error('No package.json found')
      process.exit(1)
    }

    try {
      consola.info(`Building ${packageJson.name} v${packageJson.version}`)
      await build({
        entry,
        dir,
        mode,
      })
      consola.success(`Built successfully to ${dir}`)
    }
    catch (error) {
      consola.error(error)
      process.exit(1)
    }
  },
})
