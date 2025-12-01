import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from '../shared/ui/Layout';
import { LoadingState } from '../shared/ui';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../pages/HomePage'));
const ChannelsPage = lazy(() => import('../pages/ChannelsPage'));
const ChannelDetailPage = lazy(() => import('../pages/ChannelDetailPage'));
const CreateChannelPage = lazy(() => import('../pages/CreateChannelPage'));
const EditChannelPage = lazy(() => import('../pages/EditChannelPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Wrapper component for lazy loading
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingState>Loading page...</LoadingState>}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <HomePage />
          </LazyWrapper>
        ),
      },
      {
        path: 'login',
        element: (
          <LazyWrapper>
            <LoginPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'channels',
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <ChannelsPage />
              </LazyWrapper>
            ),
          },
          {
            path: 'new',
            element: (
              <LazyWrapper>
                <ProtectedRoute>
                  <CreateChannelPage />
                </ProtectedRoute>
              </LazyWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <LazyWrapper>
                <ChannelDetailPage />
              </LazyWrapper>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <LazyWrapper>
                <ProtectedRoute>
                  <EditChannelPage />
                </ProtectedRoute>
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        path: 'playlists',
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold mb-4">Playlists</h1>
                  <p className="text-muted-foreground">
                    Playlists functionality coming soon! For now, you can view playlists on individual channel pages.
                  </p>
                </div>
              </LazyWrapper>
            ),
          },
          {
            path: 'new',
            element: (
              <LazyWrapper>
                <ProtectedRoute>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-4">Create Playlist</h1>
                    <p className="text-muted-foreground">
                      Create playlist functionality coming soon!
                    </p>
                  </div>
                </ProtectedRoute>
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        path: '*',
        element: (
          <LazyWrapper>
            <NotFoundPage />
          </LazyWrapper>
        ),
      },
    ],
  },
]);