import { createBrowserRouter } from 'react-router-dom';

import RootLayout from './layouts/RootLayout';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { LazyWrapper } from '../shared/ui/LazyWrapper';
import { ErrorPage } from '../shared/ui/ErrorPage';

import MoviesPage from '../pages/MoviesPage';
import MovieDetailPage from '../pages/MovieDetailPage';
import CreateMoviePage from '../pages/CreateMoviePage';
import EditMoviePage from '../pages/EditMoviePage';
import LoginPage from '../pages/LoginPage'; // 🔥 ВАЖНО

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      // 🔹 ГЛАВНАЯ
      {
        index: true,
        element: <MoviesPage />,
      },

      // 🔹 LOGIN (🔥 ОБЯЗАТЕЛЬНО)
      {
        path: 'login',
        element: <LoginPage />,
      },

      // 🔹 MOVIES
      {
        path: 'movies',
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <MoviesPage />
              </LazyWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <LazyWrapper>
                <MovieDetailPage />
              </LazyWrapper>
            ),
          },

          // 🔒 PROTECTED
          {
            element: <ProtectedRoute />,
            children: [
              {
                path: 'new',
                element: (
                  <LazyWrapper>
                    <CreateMoviePage />
                  </LazyWrapper>
                ),
              },
              {
                path: ':id/edit',
                element: (
                  <LazyWrapper>
                    <EditMoviePage />
                  </LazyWrapper>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);
