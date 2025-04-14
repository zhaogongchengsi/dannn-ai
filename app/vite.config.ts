import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'
import AutoImport from 'unplugin-auto-import/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    VueRouter({}),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'pinia',
      ],
      dirs: [
        './src/components/**.{vue,ts}',
        './src/composables/**.ts',
        './src/libs/**.ts',
        './src/utils/**.ts',
        './src/stores/**.ts',
      ],
    }),
    vueDevTools(),
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
      'base': resolve(__dirname, './base'),
      'common': resolve(__dirname, './common'),
    },
  },
})
