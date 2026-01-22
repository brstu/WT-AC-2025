import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',  
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }  // Игнор общих ошибок
  },
});