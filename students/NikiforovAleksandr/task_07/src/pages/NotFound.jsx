import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-6">
        Page Not Found
      </h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
        <Link to="/memes" className="btn btn-secondary">
          Browse Memes
        </Link>
      </div>
    </div>
  )
}

export default NotFound