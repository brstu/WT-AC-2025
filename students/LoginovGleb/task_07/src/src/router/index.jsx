import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { Spinner } from '../components/ui/Spinner';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const GamesListPage = lazy(() => import('../features/games/pages/GamesListPage').then(m => ({ default: m.GamesListPage })));
const GameDetailPage = lazy(() => import('../features/games/pages/GameDetailPage').then(m => ({ default: m.GameDetailPage })));
const GameNewPage = lazy(() => import('../features/games/pages/GameNewPage').then(m => ({ default: m.GameNewPage })));
const GameEditPage = lazy(() => import('../features/games/pages/GameEditPage').then(m => ({ default: m.GameEditPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<Spinner />}>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <SuspenseWrapper><HomePage /></SuspenseWrapper>,
      },
      {
        path: 'login',
        element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>,
      },
      {
        path: 'games',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <SuspenseWrapper><GamesListPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper><GameNewPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper><GameDetailPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper><GameEditPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: '*',
        element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper>,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
