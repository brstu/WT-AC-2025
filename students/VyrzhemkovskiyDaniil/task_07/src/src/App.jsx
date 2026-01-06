import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import TaskList from './pages/TaskList.jsx'
import TaskDetail from './pages/TaskDetail.jsx'
import TaskForm from './pages/TaskForm.jsx'
import Login from './pages/Login.jsx'

const ProtectedRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token)
  return token ? children : <Navigate to="/login" />
}

const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          } />
          
          <Route path="/tasks/new" element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          } />
          
          <Route path="/tasks/:id" element={
            <ProtectedRoute>
              <TaskDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/tasks/:id/edit" element={
            <ProtectedRoute>
              <TaskForm isEdit />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-gray-600">Page not found</p>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App