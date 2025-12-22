import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Layout = ({ children, isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    setIsLoggedIn(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Meme Gallery
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link to="/memes" className="text-gray-700 hover:text-blue-600">
                Memes
              </Link>
              <Link to="/memes/new" className="text-gray-700 hover:text-blue-600">
                Create Meme
              </Link>
              
              {isLoggedIn ? (
                <>
                  <span className="text-gray-600">Welcome, User!</span>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-secondary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsLoggedIn(true)}
                  className="btn btn-primary"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Meme Gallery. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2">
            Share your funniest memes with the world!
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout