import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated } from './authSelectors';

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
