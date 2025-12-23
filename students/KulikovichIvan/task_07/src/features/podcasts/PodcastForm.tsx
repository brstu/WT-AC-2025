import React from 'react'
import { useForm } from 'react-hook-form'
import type { CreatePodcastDto } from './types'

interface PodcastFormProps {
  initialData?: CreatePodcastDto
  onSubmit: (data: CreatePodcastDto) => void
  isLoading?: boolean
}

const PodcastForm: React.FC<PodcastFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePodcastDto>({
    defaultValues: initialData,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter podcast title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter podcast description"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
          <input
            {...register('host', { required: 'Host is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter host name"
          />
          {errors.host && <p className="mt-1 text-sm text-red-600">{errors.host.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
          <input
            type="number"
            {...register('duration', { 
              required: 'Duration is required',
              min: { value: 1, message: 'Duration must be at least 1 minute' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter duration"
          />
          {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Release Date *</label>
          <input
            type="date"
            {...register('releaseDate', { required: 'Release date is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.releaseDate && <p className="mt-1 text-sm text-red-600">{errors.releaseDate.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Saving...' : 'Save Podcast'}
      </button>
    </form>
  )
}

export default PodcastForm