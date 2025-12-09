import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reviewSchema } from '../../utils/validationSchemas'

export interface ReviewFormData {
  author: string
  content: string
  rating: number
}

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => void
  isLoading?: boolean
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      author: '',
      content: '',
      rating: 5,
    },
  })

  const handleFormSubmit = (data: ReviewFormData) => {
    onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ваше имя *
          </label>
          <input
            type="text"
            {...register('author')}
            className="input-field"
            placeholder="Введите ваше имя"
          />
          {errors.author && (
            <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Оценка *
          </label>
          <select
            {...register('rating', { valueAsNumber: true })}
            className="input-field"
          >
            {[5, 4, 3, 2, 1].map((num) => (
              <option key={num} value={num}>
                {num} {num === 5 ? 'звёзд' : 'звезды'}
              </option>
            ))}
          </select>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Отзыв *
        </label>
        <textarea
          rows={3}
          {...register('content')}
          className="input-field"
          placeholder="Напишите ваш отзыв"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Отправка...' : 'Добавить отзыв'}
      </button>
    </form>
  )
}

export default ReviewForm