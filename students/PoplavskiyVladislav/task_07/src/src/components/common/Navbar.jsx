import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          Каталог мероприятий
        </Link>
        <div className="navbar-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}
          >
            Главная
          </NavLink>
          <NavLink 
            to="/events" 
            className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}
          >
            Мероприятия
          </NavLink>
          <NavLink 
            to="/events/new" 
            className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}
          >
            Создать мероприятие
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar