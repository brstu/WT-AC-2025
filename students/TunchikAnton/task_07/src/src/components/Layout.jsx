import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Notification from './Notification'

const Layout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
  }

  const canGoBack = location.key !== 'default'

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="logo">
            🎬 Кинофестиваль
          </Link>
          <div className="nav-links">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Все фильмы
            </Link>
            <Link 
              to="/movies/new" 
              className={location.pathname === '/movies/new' ? 'active' : ''}
            >
              + Добавить фильм
            </Link>
            {canGoBack && (
              <button 
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
              >
                Назад
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="container">
        <Outlet context={{ showNotification }} />
      </main>

      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} Коллекция фильмов кинофестиваля</p>
        </div>
      </footer>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

export default Layout