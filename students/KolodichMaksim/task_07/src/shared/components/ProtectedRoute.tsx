import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}