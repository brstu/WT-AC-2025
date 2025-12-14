import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Loader } from './components/ui/Loader'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Ленивая загрузка страниц
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const AdDetailPage = lazy(() => import('./pages/AdDetailPage').then(m => ({ default: m.AdDetailPage })))
const CreateAdPage = lazy(() => import('./pages/CreateAdPage').then(m => ({ default: m.CreateAdPage })))
const EditAdPage = lazy(() => import('./pages/EditAdPage').then(m => ({ default: m.EditAdPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
const MyAdsPage = lazy(() => import('./pages/MyAdsPage').then(m => ({ default: m.MyAdsPage })))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loader />}>
            <HomePage />
          </Suspense>
        )
      },
      {
        path: 'ad/:id',
        element: (
          <Suspense fallback={<Loader />}>
            <AdDetailPage />
          </Suspense>
        )
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<Loader />}>
            <LoginPage />
          </Suspense>
        )
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<Loader />}>
            <RegisterPage />
          </Suspense>
        )
      },
      {
        path: 'create',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loader />}>
              <CreateAdPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'edit/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loader />}>
              <EditAdPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loader />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'my-ads',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loader />}>
              <MyAdsPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: '404',
        element: (
          <Suspense fallback={<Loader />}>
            <NotFoundPage />
          </Suspense>
        )
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />
      }
    ]
  }
])
