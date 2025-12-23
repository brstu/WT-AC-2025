import { Outlet, NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

export default function MainLayout() {
  const navigate = useNavigate()
  const isLoggedIn = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <NavLink to="/" className="text-2xl font-bold">Podcast Library</NavLink>
          <div className="space-x-6">
            <NavLink to="/" className={({ isActive }) => isActive ? 'font-bold' : ''}>Подкасты</NavLink>
            <NavLink to="/playlists" className={({ isActive }) => isActive ? 'font-bold' : ''}>Плейлисты</NavLink>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="hover:underline">Выйти</button>
            ) : (
              <NavLink to="/login">Войти</NavLink>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-8 px-4">
        <Outlet />
      </main>
    </div>
  )
}