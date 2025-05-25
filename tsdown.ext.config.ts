import { defineConfig } from 'tsdown'

export default [
  defineConfig({
    entry: [
      './extensions/chat/src/index.ts',
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
    outDir: './extensions/chat/dist',
  }),
]
