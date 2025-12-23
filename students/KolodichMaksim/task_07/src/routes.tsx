import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Loader from './shared/components/Loader';
import NotFound from './shared/components/NotFound';
import ProtectedRoute from './shared/components/ProtectedRoute';

const CourseList = lazy(() => import('./features/courses/components/CourseList'));
const CourseDetail = lazy(() => import('./features/courses/components/CourseDetail'));
const CourseForm = lazy(() => import('./features/courses/components/CourseForm'));
const Login = lazy(() => import('./features/auth/components/Login'));

const router = createBrowserRouter([
  { path: '/', element: <CourseList /> },
  { path: '/courses/:id', element: <CourseDetail /> },
  { path: '/new', element: <ProtectedRoute><CourseForm /></ProtectedRoute> },
  { path: '/edit/:id', element: <ProtectedRoute><CourseForm isEdit /></ProtectedRoute> },
  { path: '/login', element: <Login /> },
  { path: '*', element: <NotFound /> },
]);

export default function Routes() {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}