import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'
import AutoImport from 'unplugin-auto-import/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import Layouts from 'vite-plugin-vue-layouts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    VueRouter({}),
    Layouts(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'pinia',
      ],
      dirs: [
        './src/components',
        './src/composables',
        './src/libs',
        './src/utils',
        './src/stores',
      ],
    }),
    vueDevTools(),
  ],
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  base: './',
  build: {
    outDir: resolve(__dirname, './app_dist'),
  },
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src'),
      'base': resolve(__dirname, './base'),
      'common': resolve(__dirname, './common'),
    },
  },
})
