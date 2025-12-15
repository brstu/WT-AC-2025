import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { toggleTheme } from '../../store/themeSlice';
import './Navbar.css';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Учёт оборудования
        </Link>
        
        <div className="navbar-menu">
          {isAuthenticated && (
            <>
              <Link to="/equipment" className="navbar-link">
                Оборудование
              </Link>
              <Link to="/equipment/new" className="navbar-link">
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
              <span className="navbar-username">{user?.username || user?.name}</span>
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
