import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

export function RequireAuth({ children }) {
  const isAuthed = useSelector((s) => s.auth.isAuthed)
  const location = useLocation()

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}