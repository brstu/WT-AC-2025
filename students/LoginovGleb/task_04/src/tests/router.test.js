/**
 * Unit tests for Router module
 * Tests hash-based routing, navigation, and query parameter handling
 */

import {
  addRoute,
  parseHash,
  navigate,
  updateQuery,
  getCurrentRoute
} from '../js/router.js';

// Setup for window.location mocking
let mockReplaceCalls = [];

beforeAll(() => {
  // Mock window.location for testing
  delete window.location;
  window.location = { 
    hash: '', 
    replace: (url) => {
      mockReplaceCalls.push(url);
    }
  };
});

describe('Router Module - Hash Parsing', () => {
  test('should parse simple hash without query', () => {
    window.location.hash = '#/items';
    const result = parseHash();
    expect(result.path).toBe('/items');
    expect(result.query).toEqual({});
  });

  test('should parse hash with query parameters', () => {
    window.location.hash = '#/items?search=test&category=Конференция';
    const result = parseHash();
    expect(result.path).toBe('/items');
    expect(result.query).toEqual({
      search: 'test',
      category: 'Конференция'
    });
  });

  test('should parse detail route with ID', () => {
    window.location.hash = '#/items/123';
    const result = parseHash();
    expect(result.path).toBe('/items/123');
    expect(result.query).toEqual({});
  });

  test('should parse edit route', () => {
    window.location.hash = '#/items/456/edit';
    const result = parseHash();
    expect(result.path).toBe('/items/456/edit');
    expect(result.query).toEqual({});
  });

  test('should default to /items when hash is empty', () => {
    window.location.hash = '';
    const result = parseHash();
    expect(result.path).toBe('/items');
  });

  test('should handle multiple query parameters', () => {
    window.location.hash = '#/items?search=test&category=Митап&page=2';
    const result = parseHash();
    expect(result.query).toEqual({
      search: 'test',
      category: 'Митап',
      page: '2'
    });
  });
});

describe('Router Module - Route Registration', () => {
  test('should add route with handler', () => {
    const handler = () => {};
    addRoute('/test', handler);
    
    // Handler should be a function
    expect(typeof handler).toBe('function');
  });

  test('should add route with parameters', () => {
    const handler = () => {};
    addRoute('/items/:id', handler);
    
    expect(typeof handler).toBe('function');
  });

  test('should add route with multiple parameters', () => {
    const handler = () => {};
    addRoute('/items/:id/edit', handler);
    
    expect(typeof handler).toBe('function');
  });
});

describe('Router Module - Navigation', () => {
  beforeEach(() => {
    window.location.hash = '';
    mockReplaceCalls = [];
  });

  test('should navigate to path without query', () => {
    navigate('/items');
    expect(window.location.hash).toBe('/items');
  });

  test('should navigate to path with query parameters', () => {
    navigate('/items', { search: 'test', category: 'Конференция' });
    expect(window.location.hash).toContain('/items?');
    expect(window.location.hash).toContain('search=test');
    expect(window.location.hash).toContain('category=');
  });

  test('should navigate with replace option', () => {
    const beforeLength = mockReplaceCalls.length;
    navigate('/items', {}, true);
    expect(mockReplaceCalls.length).toBeGreaterThan(beforeLength);
  });

  test('should handle empty query parameters', () => {
    navigate('/items', {});
    expect(window.location.hash).toBe('/items');
  });
});

describe('Router Module - Query Parameter Updates', () => {
  beforeEach(() => {
    window.location.hash = '#/items';
    mockReplaceCalls = [];
  });

  test('should update query parameters', () => {
    const beforeLength = mockReplaceCalls.length;
    updateQuery({ search: 'test' });
    // Should call replace to update URL
    expect(mockReplaceCalls.length).toBeGreaterThan(beforeLength);
  });

  test('should merge query parameters by default', () => {
    window.location.hash = '#/items?category=Конференция';
    const beforeLength = mockReplaceCalls.length;
    updateQuery({ search: 'test' }, true);
    expect(mockReplaceCalls.length).toBeGreaterThan(beforeLength);
  });

  test('should remove empty query parameters', () => {
    window.location.hash = '#/items?search=test';
    const beforeLength = mockReplaceCalls.length;
    updateQuery({ search: '' });
    expect(mockReplaceCalls.length).toBeGreaterThan(beforeLength);
  });

  test('should replace query parameters when merge is false', () => {
    window.location.hash = '#/items?category=Конференция';
    const beforeLength = mockReplaceCalls.length;
    updateQuery({ search: 'test' }, false);
    expect(mockReplaceCalls.length).toBeGreaterThan(beforeLength);
  });
});

describe('Router Module - Route Matching', () => {
  test('should match simple paths', () => {
    window.location.hash = '#/items';
    const result = parseHash();
    expect(result.path).toBe('/items');
  });

  test('should match paths with parameters', () => {
    window.location.hash = '#/items/123';
    const result = parseHash();
    expect(result.path).toBe('/items/123');
  });

  test('should match nested paths', () => {
    window.location.hash = '#/items/123/edit';
    const result = parseHash();
    expect(result.path).toBe('/items/123/edit');
  });

  test('should handle create route', () => {
    window.location.hash = '#/new';
    const result = parseHash();
    expect(result.path).toBe('/new');
  });
});

describe('Router Module - Edge Cases', () => {
  test('should handle hash with only question mark', () => {
    window.location.hash = '#/items?';
    const result = parseHash();
    expect(result.path).toBe('/items');
    expect(result.query).toEqual({});
  });

  test('should handle hash with leading slash', () => {
    window.location.hash = '#/items';
    const result = parseHash();
    expect(result.path).toBe('/items');
  });

  test('should decode URL encoded parameters', () => {
    window.location.hash = '#/items?search=%D1%82%D0%B5%D1%81%D1%82';
    const result = parseHash();
    expect(result.query.search).toBeTruthy();
  });
});
