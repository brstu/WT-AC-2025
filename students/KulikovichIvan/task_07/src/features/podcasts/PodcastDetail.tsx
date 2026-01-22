import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetPodcastQuery, useDeletePodcastMutation } from '../api/podcastApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import { useAppSelector } from '../../app/hooks'
import type { Episode } from './types'

const PodcastDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { data: podcast, isLoading, error, refetch } = useGetPodcastQuery(id || '')
  const [deletePodcast, { isLoading: isDeleting }] = useDeletePodcastMutation()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this podcast?')) {
      return
    }
    
    try {
      await deletePodcast(id).unwrap()
      // Navigate to podcasts list after successful deletion
      window.location.href = '/podcasts'
    } catch (err) {
      console.error('Failed to delete podcast:', err)
      alert('Failed to delete podcast. Please try again.')
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorAlert message="Failed to load podcast details" onRetry={() => refetch()} />
  }

  if (!podcast) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Podcast Not Found</h2>
        <p className="text-gray-600 mb-6">The podcast you're looking for doesn't exist.</p>
        <Link
          to="/podcasts"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Browse All Podcasts
        </Link>
      </div>
    )
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format duration for display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Podcast Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center mb-4">
              <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-medium">
                {podcast.category}
              </span>
              <span className="ml-4 text-blue-100">
                {formatDuration(podcast.duration)}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{podcast.title}</h1>
            <p className="text-xl text-blue-100 max-w-3xl">{podcast.description}</p>
          </div>
          
          <div className="mt-6 md:mt-0 md:ml-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{podcast.episodes?.length || 0}</div>
                <div className="text-blue-100 text-sm">Episodes</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between pt-6 border-t border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-blue-100">Host</div>
              <div className="text-lg font-semibold">{podcast.host}</div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-blue-100">Released</div>
            <div className="text-lg font-semibold">{formatDate(podcast.releaseDate)}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link
          to="/podcasts"
          className="flex items-center px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Podcasts
        </Link>
        
        {isAuthenticated && (
          <>
            <Link
              to={`/podcasts/${id}/edit`}
              className="flex items-center px-5 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Podcast
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {isDeleting ? 'Deleting...' : 'Delete Podcast'}
            </button>
          </>
        )}
      </div>

      {/* Episodes Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="px-8 py-6">
            <h2 className="text-2xl font-bold text-gray-900">Episodes</h2>
            <p className="text-gray-600 mt-2">
              {podcast.episodes?.length || 0} episodes in this podcast series
            </p>
          </div>
        </div>

        {podcast.episodes && podcast.episodes.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {podcast.episodes.map((episode: Episode, index: number) => (
              <div key={episode.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex items-center mb-4 md:mb-0 md:w-16">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 md:ml-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{episode.title}</h3>
                        <p className="text-gray-600">{episode.description}</p>
                      </div>
                      <div className="mt-3 md:mt-0 md:ml-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {formatDuration(episode.duration)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-4">
                      <div className="flex items-center mr-6">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {formatDate(episode.publishDate)}
                      </div>
                      
                      <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Play Episode
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Episodes Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              This podcast doesn't have any episodes yet. Add episodes to start building your content.
            </p>
            {isAuthenticated && (
              <button className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add First Episode
              </button>
            )}
          </div>
        )}
      </div>

      {/* Podcast Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{podcast.duration}</div>
              <div className="text-gray-600">Total Minutes</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">1</div>
              <div className="text-gray-600">Host</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{podcast.episodes?.length || 0}</div>
              <div className="text-gray-600">Episodes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PodcastDetail