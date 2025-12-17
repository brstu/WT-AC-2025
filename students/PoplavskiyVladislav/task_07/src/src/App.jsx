import { Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import HomePage from './pages/HomePage'
import EventsPage from './features/events/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import EventCreatePage from './pages/EventCreatePage'
import EventEditPage from './pages/EventEditPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="events">
          <Route index element={<EventsPage />} />
          <Route path=":id" element={<EventDetailPage />} />
          <Route path="new" element={<EventCreatePage />} />
          <Route path=":id/edit" element={<EventEditPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App