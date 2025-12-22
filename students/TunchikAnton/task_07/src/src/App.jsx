import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import MovieDetail from './pages/MovieDetail'
import MovieCreate from './pages/MovieCreate'
import MovieEdit from './pages/MovieEdit'
import NotFound from './pages/NotFound'
import { useNotification } from './components/Layout'

// Обертка для страниц, которым нужен доступ к уведомлениям
const HomeWithNotification = () => {
  const { showNotification } = useNotification()
  return <Home />
}

const MovieDetailWithNotification = () => {
  const { showNotification } = useNotification()
  return <MovieDetail />
}

const MovieCreateWithNotification = () => {
  const { showNotification } = useNotification()
  return <MovieCreate />
}

const MovieEditWithNotification = () => {
  const { showNotification } = useNotification()
  return <MovieEdit />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeWithNotification />} />
        <Route path="movies/:id" element={<MovieDetailWithNotification />} />
        <Route path="movies/new" element={<MovieCreateWithNotification />} />
        <Route path="movies/:id/edit" element={<MovieEditWithNotification />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App