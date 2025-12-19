import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Spinner } from '../components/ui/Spinner';

// Lazy load pages for code splitting
const ProductsListPage = lazy(() => import('../features/shop/pages/ProductsListPage').then(m => ({ default: m.ProductsListPage })));
const ProductDetailPage = lazy(() => import('../features/shop/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('../features/shop/pages/CartPage').then(m => ({ default: m.CartPage })));
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
        element: <SuspenseWrapper><ProductsListPage /></SuspenseWrapper>,
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <SuspenseWrapper><ProductsListPage /></SuspenseWrapper>,
          },
          {
            path: ':id',
            element: <SuspenseWrapper><ProductDetailPage /></SuspenseWrapper>,
          },
        ],
      },
      {
        path: 'cart',
        element: <SuspenseWrapper><CartPage /></SuspenseWrapper>,
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
