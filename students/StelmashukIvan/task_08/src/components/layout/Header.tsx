import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            BookCatalog
          </Link>
          
          <div className="flex space-x-4">
            <NavLink 
              to="/books" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:text-primary-600'
                }`
              }
            >
              Книги
            </NavLink>
            
            <NavLink 
              to="/books/new" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:text-primary-600'
                }`
              }
            >
              Добавить книгу
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header