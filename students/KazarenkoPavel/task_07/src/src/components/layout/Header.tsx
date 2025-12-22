import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, PlusCircle, User, LogOut } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Объявления
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Все объявления
              </Link>
              <Link to="/categories" className="text-gray-600 hover:text-blue-600 transition-colors">
                Категории
              </Link>
              {user && (
                <Link to="/my-ads" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Мои объявления
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Поиск..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {user ? (
              <>
                <Link to="/create">
                  <Button variant="primary" size="sm">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Подать объявление
                  </Button>
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
                      {user.name}
                    </span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-sm hover:bg-gray-50"
                    >
                      Профиль
                    </Link>
                    <Link
                      to="/my-ads"
                      className="block px-4 py-3 text-sm hover:bg-gray-50"
                    >
                      Мои объявления
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-red-600"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Выйти
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Войти</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Регистрация</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
