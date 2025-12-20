/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  /* ======================
     Vite resolve
  ====================== */
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  /* ======================
     Vitest
  ====================== */
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',

    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
  },
});
