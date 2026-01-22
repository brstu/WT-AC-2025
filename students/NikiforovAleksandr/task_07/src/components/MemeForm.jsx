import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const memeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  imageUrl: z.string().url('Please enter a valid URL'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tags: z.string()
})

const MemeForm = ({ initialData = {}, onSubmit, isSubmitting, submitText }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(memeSchema),
    defaultValues: initialData
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          {...register('title')}
          type="text"
          className="form-input"
          placeholder="Enter meme title"
        />
        {errors.title && <p className="form-error">{errors.title.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Image URL</label>
        <input
          {...register('imageUrl')}
          type="url"
          className="form-input"
          placeholder="https://example.com/meme.jpg"
        />
        {errors.imageUrl && <p className="form-error">{errors.imageUrl.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="form-input"
          placeholder="Describe your meme..."
        />
        {errors.description && <p className="form-error">{errors.description.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Tags (comma separated)</label>
        <input
          {...register('tags')}
          type="text"
          className="form-input"
          placeholder="funny, programming, viral"
        />
        {errors.tags && <p className="form-error">{errors.tags.message}</p>}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  )
}

export default MemeForm