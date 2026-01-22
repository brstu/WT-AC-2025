import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePodcastMutation } from '../features/api/podcastApi'
import PodcastForm from '../features/podcasts/PodcastForm'
import type { CreatePodcastDto } from '../features/podcasts/types'

const CreatePodcastPage: React.FC = () => {
  const navigate = useNavigate()
  const [createPodcast, { isLoading }] = useCreatePodcastMutation()

  const handleSubmit = async (data: CreatePodcastDto) => {
    try {
      await createPodcast(data).unwrap()
      navigate('/podcasts')
    } catch (error) {
      console.error('Failed to create podcast:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Podcast</h1>
      <PodcastForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}

export default CreatePodcastPage