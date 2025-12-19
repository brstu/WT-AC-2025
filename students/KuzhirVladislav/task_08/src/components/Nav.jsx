import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from './Button.jsx';

function Nav() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="site-nav">
      <div className="nav-left">
        <NavLink to="/" className="brand">
          Museums
        </NavLink>
      </div>
      <div className="nav-right">
        <NavLink to="/">Home</NavLink>
        {isLoggedIn ? (
          <>
            <NavLink to="/new">New</NavLink>
            <Button variant="link" onClick={handleLogout} className="logout-btn">
              Logout
            </Button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Nav;
