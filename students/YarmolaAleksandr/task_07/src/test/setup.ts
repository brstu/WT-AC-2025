import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:3001/api',
        VITE_MOCK_API: 'true',
        VITE_APP_NAME: 'YouTube Channels Catalog',
        VITE_APP_VERSION: '1.0.0',
      },
    },
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock IntersectionObserver
(globalThis as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
};