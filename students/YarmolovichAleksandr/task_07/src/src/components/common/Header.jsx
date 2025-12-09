import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Header.css'

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          🎲 Настолки
        </Link>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Главная
          </Link>
          <Link 
            to="/games" 
            className={location.pathname === '/games' ? 'nav-link active' : 'nav-link'}
          >
            Все игры
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/games/new" 
                className={location.pathname === '/games/new' ? 'nav-link active' : 'nav-link'}
              >
                Добавить игру
              </Link>
              <div className="user-menu">
                <span className="user-name">Привет, {user?.name}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className={location.pathname === '/login' ? 'nav-link active' : 'nav-link'}
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header