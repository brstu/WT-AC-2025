import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import './Navbar.css';

export const Navbar = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const cart = useSelector((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🛍️ Mini Shop
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Shop
          </Link>
          
          <Link to="/cart" className="navbar-link navbar-cart">
            🛒 Cart
            {cartCount > 0 && <span className="navbar-cart-count">{cartCount}</span>}
          </Link>
          
          <button 
            className="theme-toggle"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
          >
            {mode === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
};
