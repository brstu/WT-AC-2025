import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetPodcastQuery, useDeletePodcastMutation } from '../features/api/podcastApi'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import { useAppSelector } from '../app/hooks'

const PodcastDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { data: podcast, isLoading, error } = useGetPodcastQuery(id!)
  const [deletePodcast] = useDeletePodcastMutation()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const handleDelete = async () => {
    if (!id) return
    
    if (window.confirm('Are you sure you want to delete this podcast?')) {
      try {
        await deletePodcast(id).unwrap()
        window.location.href = '/podcasts'
      } catch (err) {
        console.error('Failed to delete podcast:', err)
        alert('Failed to delete podcast. Please try again.')
      }
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message="Failed to load podcast details" />
  if (!podcast) return <div className="text-center py-8">Podcast not found</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{podcast.title}</h1>
              <p className="text-blue-100 text-lg">{podcast.description}</p>
            </div>
            <span className="bg-white text-blue-600 px-4 py-1 rounded-full font-semibold">
              {podcast.category}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Host
                </h3>
                <p className="text-lg font-medium">{podcast.host}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Duration
                </h3>
                <p className="text-lg font-medium">{podcast.duration} minutes</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Release Date
                </h3>
                <p className="text-lg font-medium">
                  {new Date(podcast.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Episodes
                </h3>
                <p className="text-lg font-medium">{podcast.episodes?.length || 0} episodes</p>
              </div>
            </div>
          </div>

          {/* Episodes Section */}
          {podcast.episodes && podcast.episodes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Episodes</h2>
              <div className="space-y-4">
                {podcast.episodes.map((episode) => (
                  <div key={episode.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg mb-1">{episode.title}</h4>
                        <p className="text-gray-600 mb-2">{episode.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-4">
                            {episode.duration} min
                          </span>
                          <span>
                            {new Date(episode.publishDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
            <Link
              to="/podcasts"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Back to List
            </Link>
            
            {isAuthenticated && (
              <>
                <Link
                  to={`/podcasts/${id}/edit`}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                >
                  Edit Podcast
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  Delete Podcast
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PodcastDetailPage