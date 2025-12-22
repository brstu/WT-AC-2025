import React from 'react'
import { Link } from 'react-router-dom'
import { useGetPodcastsQuery, useDeletePodcastMutation } from '../api/podcastApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import { useAppSelector } from '../../app/hooks'

const PodcastList: React.FC = () => {
  const { data: podcasts, isLoading, error } = useGetPodcastsQuery()
  const [deletePodcast] = useDeletePodcastMutation()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this podcast?')) {
      await deletePodcast(id)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message="Failed to load podcasts" />
  if (!podcasts?.length) return <div className="text-center py-8">No podcasts found</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {podcasts.map((podcast) => (
        <div key={podcast.id} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-2">{podcast.title}</h3>
          <p className="text-gray-600 mb-2">{podcast.description}</p>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">{podcast.host}</span>
            <span className="text-sm text-gray-500">{podcast.duration} min</span>
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/podcasts/${podcast.id}`}
              className="flex-1 text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              View
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to={`/podcasts/${podcast.id}/edit`}
                  className="flex-1 text-center bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(podcast.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PodcastList