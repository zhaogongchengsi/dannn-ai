import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    './src/node/main/index.ts',
    './src/node/main/preload.ts',
  ],
  alias: {
    '~': './src',
  },
  shims: true,
  platform: 'node',
  loader: {
    '.png': 'dataurl',
  },
  external: ['electron'],
  copy: './public',
  outDir: './app_dist',
  clean: false,
})
