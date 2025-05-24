import { defineConfig } from 'tsdown'

export default [
  defineConfig({
    entry: [
      './extensions/deepseek/src/index.ts',
    ],
    alias: {
      '~': './src',
    },
    shims: true,
    loader: {
      '.png': 'dataurl',
      '.svg': 'dataurl',
    },
    external: ['electron'],
    outDir: './extensions/deepseek/dist',
  }),
]
