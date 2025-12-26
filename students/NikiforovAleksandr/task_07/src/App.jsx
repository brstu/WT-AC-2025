import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom'
import MemeList from './pages/MemeList'
import MemeDetail from './pages/MemeDetail'
import CreateMeme from './pages/CreateMeme'
import EditMeme from './pages/EditMeme'
import NotFound from './pages/NotFound'

// Компонент для защищённых маршрутов
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/')
    }
  }, [isLoggedIn, navigate])
  
  if (!isLoggedIn) {
    return null
  }
  
  return children
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  })

  const handleLogin = () => {
    setIsLoggedIn(true)
    localStorage.setItem('isLoggedIn', 'true')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('isLoggedIn')
  }

  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <Link to="/" className="logo">
              <div className="logo-icon">😂</div>
              <div className="logo-text">Мем-Галерея</div>
            </Link>
            
            <nav className="nav-links">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Главная
              </NavLink>
              <NavLink to="/memes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Все мемы
              </NavLink>
              
              {isLoggedIn ? (
                <>
                  <NavLink to="/memes/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Создать мем
                  </NavLink>
                  <span className="nav-link">👤 Привет, пользователь!</span>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="btn btn-primary btn-sm"
                >
                  Войти
                </button>
              )}
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                <div className="hero">
                  <h1>Мем-Галерея</h1>
                  <p>
                    Добро пожаловать в мир смешных мемов! {!isLoggedIn && 'Войдите, чтобы создавать свои мемы и ставить лайки.'}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/memes" className="btn btn-primary">
                      Смотреть все мемы
                    </Link>
                    {isLoggedIn ? (
                      <Link to="/memes/new" className="btn btn-secondary">
                        Создать мем
                      </Link>
                    ) : (
                      <button onClick={handleLogin} className="btn btn-secondary">
                        Войти для создания мемов
                      </button>
                    )}
                  </div>
                </div>

                <div className="features">
                  <div className="feature-card">
                    <div className="feature-icon">😂</div>
                    <h3 className="feature-title">Большая коллекция</h3>
                    <p className="feature-description">
                      Найдите самые смешные мемы на любую тему и настроение
                    </p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">⭐</div>
                    <h3 className="feature-title">Честные рейтинги</h3>
                    <p className="feature-description">
                      Оценки от реальных пользователей помогут найти лучшие мемы
                    </p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">👥</div>
                    <h3 className="feature-title">Сообщество</h3>
                    <p className="feature-description">
                      Присоединяйтесь к сообществу любителей мемов
                    </p>
                  </div>
                </div>
              </>
            } />
            
            <Route path="/memes" element={<MemeList isLoggedIn={isLoggedIn} />} />
            <Route path="/memes/new" element={
              <ProtectedRoute>
                <CreateMeme />
              </ProtectedRoute>
            } />
            <Route path="/memes/:id" element={<MemeDetail isLoggedIn={isLoggedIn} />} />
            <Route path="/memes/:id/edit" element={
              <ProtectedRoute>
                <EditMeme />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <p>© 2025 Мем-Галерея. Все права защищены.</p>
            <p className="footer-text">
              {!isLoggedIn ? 'Войдите, чтобы делиться мемами!' : 'Делитесь самыми смешными мемами!'}
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App