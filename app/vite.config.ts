import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(), 
    VueRouter({}), 
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core'
      ],
      dirs: [
        './src/components',
        './src/composables',
        './src/libs',
        './src/utils',
      ]
    })
  ],
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        setting: resolve(__dirname, 'setting.html'),
      },
    },
  },
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
