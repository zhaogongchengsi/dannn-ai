import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
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
