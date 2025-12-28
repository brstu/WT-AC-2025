import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { memeApi } from '../services/memeApi'
import MemeForm from '../components/MemeForm'

const EditMeme = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [meme, setMeme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchMeme()
  }, [id])

  const fetchMeme = async () => {
    try {
      setLoading(true)
      const response = await memeApi.getMeme(id)
      setMeme(response.data)
    } catch (error) {
      console.error('Error fetching meme:', error)
      alert('Failed to load meme')
      navigate('/memes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      
      // Convert tags string to array
      const memeData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
      
      await memeApi.updateMeme(id, memeData)
      navigate(`/memes/${id}`)
    } catch (error) {
      console.error('Error updating meme:', error)
      alert('Failed to update meme')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Meme</h1>
      <MemeForm
        initialData={{
          title: meme.title,
          imageUrl: meme.imageUrl,
          description: meme.description,
          tags: meme.tags.join(', ')
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText="Save Changes"
      />
    </div>
  )
}

export default EditMeme