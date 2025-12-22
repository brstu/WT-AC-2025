import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAppSelector } from '../app/hooks'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../pages/HomePage'))
const PodcastsPage = lazy(() => import('../pages/PodcastsPage'))
const PodcastDetailPage = lazy(() => import('../pages/PodcastDetailPage'))
const CreatePodcastPage = lazy(() => import('../pages/CreatePodcastPage'))
const EditPodcastPage = lazy(() => import('../pages/EditPodcastPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="podcasts">
            <Route index element={<PodcastsPage />} />
            <Route path=":id" element={<PodcastDetailPage />} />
            <Route
              path="new"
              element={
                <PrivateRoute>
                  <CreatePodcastPage />
                </PrivateRoute>
              }
            />
            <Route
              path=":id/edit"
              element={
                <PrivateRoute>
                  <EditPodcastPage />
                </PrivateRoute>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes