import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { Spinner } from '../components/ui/Spinner';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() =>
  import('../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const EquipmentListPage = lazy(() =>
  import('../features/equipment/pages/EquipmentListPage').then((m) => ({
    default: m.EquipmentListPage,
  }))
);
const EquipmentDetailPage = lazy(() =>
  import('../features/equipment/pages/EquipmentDetailPage').then((m) => ({
    default: m.EquipmentDetailPage,
  }))
);
const EquipmentNewPage = lazy(() =>
  import('../features/equipment/pages/EquipmentNewPage').then((m) => ({
    default: m.EquipmentNewPage,
  }))
);
const EquipmentEditPage = lazy(() =>
  import('../features/equipment/pages/EquipmentEditPage').then((m) => ({
    default: m.EquipmentEditPage,
  }))
);
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const SuspenseWrapper = ({ children }) => <Suspense fallback={<Spinner />}>{children}</Suspense>;

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
        path: 'equipment',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <SuspenseWrapper>
                  <EquipmentListPage />
                </SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper>
                  <EquipmentNewPage />
                </SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper>
                  <EquipmentDetailPage />
                </SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper>
                  <EquipmentEditPage />
                </SuspenseWrapper>
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

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
