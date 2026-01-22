import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

// Ленивые маршруты для бонусного code splitting
const NoteList = lazy(() => import("./features/notes/NoteList"));
const NoteDetail = lazy(() => import("./features/notes/NoteDetail"));
const NewNote = lazy(() => import("./features/notes/NewNote"));
const EditNote = lazy(() => import("./features/notes/EditNote"));
import NotFound from "./components/NotFound";

// Симулированный protected route (для логина)
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Загрузка...</div>}>
        <NoteList />
      </Suspense>
    ),
  },
  {
    path: "/notes/:id",
    element: (
      <Suspense fallback={<div>Загрузка...</div>}>
        <NoteDetail />
      </Suspense>
    ),
  },
  {
    path: "/new",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<div>Загрузка...</div>}>
          <NewNote />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit/:id",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<div>Загрузка...</div>}>
          <EditNote />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

// Экспортируйте router для использования в App.tsx
export { router };