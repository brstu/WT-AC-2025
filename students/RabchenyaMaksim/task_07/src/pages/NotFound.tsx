import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl mt-4">Страница не найдена</p>
      <Link to="/" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700">
        Вернуться на главную
      </Link>
    </div>
  )
}