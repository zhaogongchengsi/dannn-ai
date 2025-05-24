import process from 'node:process'
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
  define: {
    MODE: JSON.stringify(process.env.MODE || 'dev'),
  },
  external: ['electron'],
  copy: './public',
})
