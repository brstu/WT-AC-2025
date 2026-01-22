import { createSlice } from '@reduxjs/toolkit'

const LS_KEY = 'demo_auth'

const initialState = {
  isAuthed: localStorage.getItem(LS_KEY) === '1',
  user: localStorage.getItem(LS_KEY) === '1' ? { name: 'Student' } : null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthed = true
      state.user = { name: action.payload?.name || 'Student' }
      localStorage.setItem(LS_KEY, '1')
    },
    logout(state) {
      state.isAuthed = false
      state.user = null
      localStorage.removeItem(LS_KEY)
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer