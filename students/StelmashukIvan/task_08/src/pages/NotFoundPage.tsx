import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-semibold mt-4">Страница не найдена</h2>
        <p className="text-gray-600 mt-2 mb-8">
          Извините, запрашиваемая страница не существует.
        </p>
        <Link
          to="/books"
          className="btn-primary inline-block px-8 py-3"
        >
          Вернуться к книгам
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage