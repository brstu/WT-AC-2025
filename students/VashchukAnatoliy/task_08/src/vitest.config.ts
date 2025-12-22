/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',

    setupFiles: path.resolve(__dirname, 'src/test/setup.ts'),

    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ],

    exclude: [
      'node_modules',
      'dist',
    ],
  },
})
