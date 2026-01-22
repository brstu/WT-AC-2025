import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  type: 'success' | 'error' | 'info'
  message: string
}

interface AuthState {
  isAuthenticated: boolean
  user: { username: string } | null
  notification: Notification | null
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')!) 
    : null,
  notification: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string }>) => {
      state.isAuthenticated = true
      state.user = action.payload
      state.notification = { type: 'success', message: 'Successfully logged in!' }
      localStorage.setItem('token', 'fake-jwt-token')
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.notification = { type: 'info', message: 'Logged out successfully' }
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    setNotification: (state, action: PayloadAction<Notification>) => {
      state.notification = action.payload
    },
    clearNotification: (state) => {
      state.notification = null
    },
  },
})

export const { login, logout, setNotification, clearNotification } = authSlice.actions
export default authSlice.reducer