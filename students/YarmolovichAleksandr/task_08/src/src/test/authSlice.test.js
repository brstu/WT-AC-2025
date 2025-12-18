import authReducer, { login, logout } from '../features/auth/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false
  };

  it('should handle login', () => {
    const user = { id: 1, name: 'Test User', email: 'test@example.com' };
    const action = login(user);
    const state = authReducer(initialState, action);
    
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle logout', () => {
    const stateWithUser = {
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true
    };
    const action = logout();
    const state = authReducer(stateWithUser, action);
    
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});