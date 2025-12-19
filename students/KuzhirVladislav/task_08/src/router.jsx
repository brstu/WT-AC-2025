import { createBrowserRouter, Navigate } from 'react-router-dom';
import MuseumsList from './pages/MuseumsList.jsx';
import MuseumDetail from './pages/MuseumDetail.jsx';
import MuseumForm from './pages/MuseumForm.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Nav from './components/Nav.jsx';

const isAuthenticated = () => !!localStorage.getItem('token');

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Nav />
        <MuseumsList />
      </>
    ),
  },
  {
    path: '/museum/:id',
    element: (
      <>
        <Nav />
        <MuseumDetail />
      </>
    ),
  },
  {
    path: '/new',
    element: (
      <ProtectedRoute>
        <Nav />
        <MuseumForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/edit/:id',
    element: (
      <ProtectedRoute>
        <Nav />
        <MuseumForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <>
        <Nav />
        <Login />
      </>
    ),
  },
  {
    path: '/register',
    element: (
      <>
        <Nav />
        <Register />
      </>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
