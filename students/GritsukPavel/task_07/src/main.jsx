import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import ProjectList from './pages/ProjectList'
import ProjectDetail from './pages/ProjectDetail'
import ProjectNew from './pages/ProjectNew'
import ProjectEdit from './pages/ProjectEdit'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <div style={{fontFamily: 'Arial', margin: '20px'}}>
        <nav style={{marginBottom: '20px', padding: '10px', background: '#f0f0f0'}}>
          <Link to="/" style={{marginRight: '15px'}}>Главная</Link>
          <Link to="/projects/new">Добавить проект</Link>
        </nav>
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/new" element={<ProjectNew />} />
          <Route path="/projects/:id/edit" element={<ProjectEdit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
