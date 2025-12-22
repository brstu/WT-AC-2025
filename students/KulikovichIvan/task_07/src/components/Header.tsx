import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { logout } from '../features/auth/authSlice'

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          PodcastBase
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link to="/podcasts" className="text-gray-700 hover:text-blue-600">
            Podcasts
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/podcasts/new" className="text-gray-700 hover:text-blue-600">
                New Podcast
              </Link>
              <span className="text-gray-700">Hello, {user?.username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => dispatch(login({ username: 'admin' }))}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header