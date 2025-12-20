import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { adsApi } from '../app/api'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loginMutation] = adsApi.useLoginMutation()
  const [registerMutation] = adsApi.useRegisterMutation()

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await loginMutation({ email, password }).unwrap()
      localStorage.setItem('token', response.token)
      return response.user
    } catch (error) {
      throw error
    }
  }, [loginMutation])

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await registerMutation({ name, email, password }).unwrap()
      return response
    } catch (error) {
      throw error
    }
  }, [registerMutation])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    dispatch(adsApi.util.resetApiState())
    navigate('/login')
  }, [dispatch, navigate])

  const getCurrentUser = useCallback(() => {
    const token = localStorage.getItem('token')
    return token ? { isAuthenticated: true } : { isAuthenticated: false }
  }, [])

  return {
    login,
    register,
    logout,
    getCurrentUser
  }
}
