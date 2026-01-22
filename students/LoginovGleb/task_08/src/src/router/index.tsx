import { lazy, Suspense, ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { Spinner } from '../components/ui/Spinner';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() =>
  import('../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
import { GamesListPage } from '../features/games/pages/GamesListPage.tsx';
import { GameDetailPage } from '../features/games/pages/GameDetailPage.tsx';
import { GameNewPage } from '../features/games/pages/GameNewPage.tsx';
import { GameEditPage } from '../features/games/pages/GameEditPage.tsx';
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const SuspenseWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<Spinner />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'login',
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'games',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <GamesListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute>
                <GameNewPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <ProtectedRoute>
                <GameDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute>
                <GameEditPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: '*',
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
