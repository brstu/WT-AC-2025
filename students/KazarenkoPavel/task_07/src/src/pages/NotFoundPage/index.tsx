import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="max-w-md">
        <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Страница не найдена</h2>
        <p className="text-gray-600 mb-8">
          Извините, мы не смогли найти страницу, которую вы ищете.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="primary">
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Поиск объявлений
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
