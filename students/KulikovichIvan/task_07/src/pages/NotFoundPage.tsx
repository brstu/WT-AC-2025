import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-16">
      <h1 className="text-9xl font-bold text-gray-800">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mt-4">Page Not Found</h2>
      <p className="text-gray-600 mt-2">The page you are looking for doesn't exist.</p>
      <Link
        to="/"
        className="inline-block mt-8 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
      >
        Go Home
      </Link>
    </div>
  )
}

export default NotFoundPage