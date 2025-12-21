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
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should handle login action', () => {
    const initialState = {
      user: null,
      token: null,
      isAuthenticated: false,
    };

    const loginPayload = {
      user: { id: 1, username: 'testuser', role: 'admin' },
      token: 'test-token-123',
    };

    const nextState = authReducer(initialState, login(loginPayload));

    expect(nextState.user).toEqual(loginPayload.user);
    expect(nextState.token).toBe('test-token-123');
    expect(nextState.isAuthenticated).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify(loginPayload.user)
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token-123');
  });

  it('should handle logout action', () => {
    const loggedInState = {
      user: { id: 1, username: 'testuser', role: 'admin' },
      token: 'test-token-123',
      isAuthenticated: true,
    };

    const nextState = authReducer(loggedInState, logout());

    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('should preserve user data after login', () => {
    const initialState = {
      user: null,
      token: null,
      isAuthenticated: false,
    };

    const user1 = {
      user: { id: 1, username: 'user1', role: 'user' },
      token: 'token1',
    };

    const state1 = authReducer(initialState, login(user1));
    expect(state1.user.username).toBe('user1');
    expect(state1.isAuthenticated).toBe(true);
  });

  it('should handle multiple login/logout cycles', () => {
    let state = {
      user: null,
      token: null,
      isAuthenticated: false,
    };

    // First login
    state = authReducer(state, login({ user: { id: 1, username: 'user1' }, token: 'token1' }));
    expect(state.isAuthenticated).toBe(true);

    // Logout
    state = authReducer(state, logout());
    expect(state.isAuthenticated).toBe(false);

    // Second login
    state = authReducer(state, login({ user: { id: 2, username: 'user2' }, token: 'token2' }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.user.username).toBe('user2');
  });
});
