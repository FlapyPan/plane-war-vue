import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import postcssPresetEnv from 'postcss-preset-env'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    cssCodeSplit: false,
  },
  plugins: [
    vue(),
  ],
  css: {
    postcss: {
      plugins: [
        postcssPresetEnv({
          browsers: ['Chrome >= 87', 'Firefox >= 78', 'Safari >= 14', 'Edge >= 88'],
          features: {
            'nesting-rules': true,
          },
        }),
      ],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
