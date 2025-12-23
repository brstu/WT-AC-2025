import { describe, it, expect, beforeEach, vi } from 'vitest';
import authReducer, { login, logout } from './authSlice';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state when not authenticated', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const initialState = { user: null, token: null, isAuthenticated: false };
    
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle login action', () => {
    const payload = { user: { username: 'testuser', role: 'admin' }, token: 'test-token-123' };
    const initialState = { user: null, token: null, isAuthenticated: false };
    
    const nextState = authReducer(initialState, login(payload));
    
    expect(nextState.user).toEqual(payload.user);
    expect(nextState.token).toBe(payload.token);
    expect(nextState.isAuthenticated).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(payload.user));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', payload.token);
  });

  it('should handle logout action', () => {
    const authenticatedState = {
      user: { username: 'testuser', role: 'admin' },
      token: 'test-token',
      isAuthenticated: true,
    };
    
    const nextState = authReducer(authenticatedState, logout());
    
    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('should persist user data in localStorage on login', () => {
    const payload = { user: { username: 'john', role: 'manager' }, token: 'jwt-token' };
    authReducer({ user: null, token: null, isAuthenticated: false }, login(payload));
    
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify(payload.user)
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', payload.token);
  });

  it('should remove user data from localStorage on logout', () => {
    const authenticatedState = {
      user: { username: 'testuser' },
      token: 'test-token',
      isAuthenticated: true,
    };
    
    authReducer(authenticatedState, logout());
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });
});
