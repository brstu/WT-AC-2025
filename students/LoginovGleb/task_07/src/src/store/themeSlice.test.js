import { describe, it, expect, beforeEach, vi } from 'vitest';
import themeReducer, { toggleTheme, setTheme } from './themeSlice';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
global.window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock document.documentElement
global.document = {
  documentElement: {
    setAttribute: vi.fn(),
  },
};

describe('themeSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle toggleTheme from light to dark', () => {
    const initialState = { mode: 'light' };
    const nextState = themeReducer(initialState, toggleTheme());
    
    expect(nextState.mode).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('should handle toggleTheme from dark to light', () => {
    const initialState = { mode: 'dark' };
    const nextState = themeReducer(initialState, toggleTheme());
    
    expect(nextState.mode).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });

  it('should handle setTheme action', () => {
    const initialState = { mode: 'light' };
    const nextState = themeReducer(initialState, setTheme('dark'));
    
    expect(nextState.mode).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });
});
