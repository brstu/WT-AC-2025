import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../shared/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const storedUser = localStorage.getItem('auth_user');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: Boolean(storedUser),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('auth_user', JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth_user');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
