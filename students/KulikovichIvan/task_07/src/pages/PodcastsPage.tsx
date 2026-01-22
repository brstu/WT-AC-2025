import React from 'react'
import { useAppSelector } from '../app/hooks'
import PodcastList from '../features/podcasts/PodcastList'

const PodcastsPage: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Podcasts</h1>
            <p className="text-gray-600 mt-2">
              Browse our collection of amazing podcasts
            </p>
          </div>
          {isAuthenticated && (
            <a
              href="/podcasts/new"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              + New Podcast
            </a>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            All
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
            Technology
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
            Business
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
            Entertainment
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
            Education
          </button>
        </div>
      </div>

      <PodcastList />
    </div>
  )
}

export default PodcastsPage