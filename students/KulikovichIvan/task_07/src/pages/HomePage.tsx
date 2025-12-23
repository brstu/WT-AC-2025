import React from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to PodcastBase
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Your ultimate platform for managing, discovering, and sharing amazing podcasts.
          Explore our collection or create your own!
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
          <Link
            to="/podcasts"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Browse Podcasts
          </Link>
          
          {isAuthenticated ? (
            <Link
              to="/podcasts/new"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              Create New Podcast
            </Link>
          ) : (
            <button className="bg-gray-200 text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold cursor-not-allowed opacity-75">
              Login to Create
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">🎙️</div>
            <h3 className="text-xl font-bold mb-3">Manage Podcasts</h3>
            <p className="text-gray-600">
              Create, edit, and organize your podcast collection with our intuitive dashboard.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-3">Discover Content</h3>
            <p className="text-gray-600">
              Browse through a wide variety of podcasts across different categories and interests.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Track Episodes</h3>
            <p className="text-gray-600">
              Keep track of episodes, durations, and release dates for all your favorite podcasts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage