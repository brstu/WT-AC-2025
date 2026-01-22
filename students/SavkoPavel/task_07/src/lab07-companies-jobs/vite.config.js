import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/lab07-companies-jobs/', // ← ИМЯ РЕПОЗИТОРИЯ
  plugins: [react()],
})
