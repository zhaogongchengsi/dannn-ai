import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), VueRouter({})],
  css: {
    postcss: {
      plugins: [tailwind()],
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
