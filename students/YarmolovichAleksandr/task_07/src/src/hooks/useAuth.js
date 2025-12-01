import { useSelector, useDispatch } from 'react-redux'
import { login, logout } from '../features/auth/authSlice'

export const useAuth = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const handleLogin = (userData) => {
    dispatch(login(userData))
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
  }
}