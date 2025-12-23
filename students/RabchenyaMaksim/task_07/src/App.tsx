import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import MainLayout from './layouts/MainLayout'
import PodcastList from './features/podcasts/PodcastList'
import PodcastDetail from './features/podcasts/PodcastDetail'
import PlaylistList from './features/playlists/PlaylistList'
import PlaylistDetail from './features/playlists/PlaylistDetail'
import PlaylistCreate from './features/playlists/PlaylistCreate'
import PlaylistEdit from './features/playlists/PlaylistEdit'
import NotFound from './pages/NotFound'
import Login from './pages/Login'

const queryClient = new QueryClient()

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = localStorage.getItem('token')
  return isLoggedIn ? children : <Navigate to="/login" />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<PodcastList />} />
            <Route path="podcasts/:id" element={<PodcastDetail />} />
            <Route path="playlists">
              <Route index element={<PlaylistList />} />
              <Route path=":id" element={<PlaylistDetail />} />
              <Route path="new" element={<ProtectedRoute><PlaylistCreate /></ProtectedRoute>} />
              <Route path=":id/edit" element={<ProtectedRoute><PlaylistEdit /></ProtectedRoute>} />
            </Route>
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App