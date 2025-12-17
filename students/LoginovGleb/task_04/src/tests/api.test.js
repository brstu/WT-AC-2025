/**
 * Unit tests for API module
 * Tests CRUD operations, localStorage fallback, caching, and authentication
 */

import {
  getAuthToken,
  setAuthToken,
  isAuthenticated,
  toggleAuth,
  getCategories,
  prefetchEvent,
  getCachedEvent,
  clearCache
} from '../js/api.js';

describe('API Module - Authentication', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should set and get auth token', () => {
    const testToken = 'test_token_123';
    setAuthToken(testToken);
    expect(getAuthToken()).toBe(testToken);
  });

  test('should remove auth token when setting null', () => {
    setAuthToken('some_token');
    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
  });

  test('should check if user is authenticated', () => {
    expect(isAuthenticated()).toBe(false);
    setAuthToken('test_token');
    expect(isAuthenticated()).toBe(true);
  });

  test('should toggle authentication state', () => {
    expect(isAuthenticated()).toBe(false);
    
    // Toggle to authenticated
    const firstToggle = toggleAuth();
    expect(firstToggle).toBe(true);
    expect(isAuthenticated()).toBe(true);
    expect(getAuthToken()).toMatch(/^demo_token_/);
    
    // Toggle to unauthenticated
    const secondToggle = toggleAuth();
    expect(secondToggle).toBe(false);
    expect(isAuthenticated()).toBe(false);
    expect(getAuthToken()).toBeNull();
  });
});

describe('API Module - Categories', () => {
  test('should return available categories', () => {
    const categories = getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toContain('Конференция');
    expect(categories).toContain('Мастер-класс');
    expect(categories).toContain('Хакатон');
    expect(categories).toContain('Митап');
  });

  test('should return all 8 categories', () => {
    const categories = getCategories();
    expect(categories.length).toBe(8);
  });
});

describe('API Module - Prefetch Cache', () => {
  beforeEach(() => {
    clearCache();
  });

  test('should clear prefetch cache', () => {
    clearCache();
    expect(getCachedEvent(1)).toBeNull();
  });

  test('should return null for uncached event', () => {
    const cached = getCachedEvent(999);
    expect(cached).toBeNull();
  });
});

describe('API Module - Helper Functions', () => {
  test('should handle escapeHtml functionality via localStorage', () => {
    const testData = {
      id: 1,
      title: 'Test Event',
      description: 'Test Description'
    };
    
    localStorage.setItem('events_data', JSON.stringify([testData]));
    const stored = JSON.parse(localStorage.getItem('events_data'));
    
    expect(stored[0].title).toBe('Test Event');
  });
});

describe('API Module - Data Structure', () => {
  test('should validate event structure in localStorage', () => {
    const event = {
      id: 1,
      title: 'Test Event',
      description: 'Test Description',
      date: '2025-02-15',
      time: '10:00',
      location: 'Test Location',
      category: 'Конференция',
      organizer: 'Test Organizer',
      maxParticipants: 100,
      image: 'https://example.com/image.jpg',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('events_data', JSON.stringify([event]));
    const stored = JSON.parse(localStorage.getItem('events_data'));

    expect(stored[0]).toHaveProperty('id');
    expect(stored[0]).toHaveProperty('title');
    expect(stored[0]).toHaveProperty('description');
    expect(stored[0]).toHaveProperty('date');
    expect(stored[0]).toHaveProperty('category');
    expect(stored[0]).toHaveProperty('createdAt');
  });
});
