import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { toggleTheme } from '../../store/themeSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import './Navbar.css';

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { mode } = useAppSelector((state) => state.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Каталог игр
        </Link>

        <div className="navbar-menu">
          {isAuthenticated && (
            <>
              <Link to="/games" className="navbar-link">
                Игры
              </Link>
              <Link to="/games/new" className="navbar-link">
                Добавить
              </Link>
            </>
          )}

          <button
            className="theme-toggle"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Переключить тему"
          >
            {mode === 'light' ? '🌙' : '☀️'}
          </button>

          {isAuthenticated ? (
            <div className="navbar-user">
              <span className="navbar-username">{user?.username}</span>
              <button className="navbar-logout" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-link">
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
