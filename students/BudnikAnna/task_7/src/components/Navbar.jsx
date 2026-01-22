import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../app/auth/authSlice'

export function Navbar() {
  const { isAuthed } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <header className="nav">
      <div className="container nav__inner">
        <div className="nav__brand" onClick={() => navigate('/programs')} role="button" tabIndex={0}>
          🏋️ Каталог программ
        </div>

        <nav className="nav__links">
          <NavLink to="/programs" className="nav__link">
            Список
          </NavLink>

          {isAuthed ? (
            <>
              <NavLink to="/programs/new" className="nav__link">
                Новая
              </NavLink>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  dispatch(logout())
                  navigate('/programs')
                }}
              >
                Выйти
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn">
              Войти
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}