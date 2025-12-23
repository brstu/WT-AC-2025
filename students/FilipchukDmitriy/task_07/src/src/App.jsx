import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import ProjectsList from './pages/ProjectsList'
import ProjectDetail from './pages/ProjectDetail'
import ProjectForm from './pages/ProjectForm'
import NotFound from './pages/NotFound'

var appName = 'Справочник Open-Source проектов'

function App() {
  return (
    <BrowserRouter>
      <div style={{fontFamily: 'Arial'}}>
        <nav style={{backgroundColor: '#333', padding: '20px', marginBottom: '20px'}}>
          <h1 style={{color: 'white', margin: '0 0 10px 0'}}>{appName}</h1>
          <div style={{display: 'flex', gap: '15px'}}>
            <Link to="/" style={{color: 'white', textDecoration: 'none'}}>Главная</Link>
            <Link to="/new" style={{color: 'white', textDecoration: 'none'}}>Добавить проект</Link>
          </div>
        </nav>
        
        <div style={{padding: '0 20px'}}>
          <Routes>
            <Route path="/" element={<ProjectsList />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/new" element={<ProjectForm />} />
            <Route path="/edit/:id" element={<ProjectForm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
