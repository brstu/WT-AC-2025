import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetPodcastQuery, useUpdatePodcastMutation } from '../features/api/podcastApi'
import PodcastForm from '../features/podcasts/PodcastForm'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import type { CreatePodcastDto } from '../features/podcasts/types'

const EditPodcastPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: podcast, isLoading, error } = useGetPodcastQuery(id!)
  const [updatePodcast, { isLoading: isUpdating }] = useUpdatePodcastMutation()

  const handleSubmit = async (data: CreatePodcastDto) => {
    if (!id) return
    
    try {
      await updatePodcast({ id, data }).unwrap()
      navigate(`/podcasts/${id}`)
    } catch (error) {
      console.error('Failed to update podcast:', error)
      alert('Failed to update podcast. Please try again.')
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message="Failed to load podcast" />
  if (!podcast) return <div>Podcast not found</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Podcast</h1>
        <p className="text-gray-600">Update the details of your podcast</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <PodcastForm 
          initialData={podcast}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
        />
      </div>
    </div>
  )
}

export default EditPodcastPage