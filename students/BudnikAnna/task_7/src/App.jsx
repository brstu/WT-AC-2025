import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProgramsLayout } from './pages/Programs/ProgramsLayout'
import { ProgramsList } from './pages/Programs/ProgramsList'
import { ProgramDetail } from './pages/Programs/ProgramDetail'
import { ProgramForm } from './pages/Programs/ProgramForm'
import { Login } from './pages/Login'
import { NotFound } from './pages/NotFound'
import { RequireAuth } from './app/auth/RequireAuth'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/programs" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/programs" element={<ProgramsLayout />}>
          <Route index element={<ProgramsList />} />
          <Route path=":id" element={<ProgramDetail />} />

          {/* защищенные */}
          <Route
            path="new"
            element={
              <RequireAuth>
                <ProgramForm mode="create" />
              </RequireAuth>
            }
          />
          <Route
            path=":id/edit"
            element={
              <RequireAuth>
                <ProgramForm mode="edit" />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}