import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Мокаем localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Мокаем fetch для API тестов
global.fetch = vi.fn()

// Очистка после каждого теста
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
