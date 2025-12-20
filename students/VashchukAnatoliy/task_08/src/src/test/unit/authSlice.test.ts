import { describe, it, expect, beforeEach } from 'vitest'
import authReducer, { loginSuccess, logout } from '@/features/auth/authSlice'
import type { User } from '@/shared/types'

describe('authSlice', () => {
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it('должен авторизовать пользователя и сохранить его в localStorage', () => {
    const initialState = {
      user: null,
      isAuthenticated: false,
    }

    const nextState = authReducer(
      initialState,
      loginSuccess(mockUser)
    )

    expect(nextState.user).toEqual(mockUser)
    expect(nextState.isAuthenticated).toBe(true)

    const storedUser = localStorage.getItem('auth_user')
    expect(storedUser).toBe(JSON.stringify(mockUser))
  })

  it('должен разлогинить пользователя и очистить localStorage', () => {
    localStorage.setItem('auth_user', JSON.stringify(mockUser))

    const initialState = {
      user: mockUser,
      isAuthenticated: true,
    }

    const nextState = authReducer(initialState, logout())

    expect(nextState.user).toBeNull()
    expect(nextState.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth_user')).toBeNull()
  })
})
