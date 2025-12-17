import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookSchema } from '../../utils/validationSchemas'
import type { BookFormData } from '../../features/books/booksTypes'

interface BookFormProps {
  onSubmit: (data: BookFormData) => void
  initialData?: Partial<BookFormData>
  isLoading?: boolean
}

const BookForm: React.FC<BookFormProps> = ({ 
  onSubmit, 
  initialData, 
  isLoading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: initialData,
  })

  const currentYear = new Date().getFullYear()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название книги *
        </label>
        <input
          type="text"
          {...register('title')}
          className="input-field"
          placeholder="Введите название книги"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Автор *
        </label>
        <input
          type="text"
          {...register('author')}
          className="input-field"
          placeholder="Введите имя автора"
        />
        {errors.author && (
          <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Описание *
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="input-field"
          placeholder="Опишите книгу"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Год публикации *
          </label>
          <input
            type="number"
            {...register('publishedYear', { valueAsNumber: true })}
            className="input-field"
            min="1000"
            max={currentYear}
          />
          {errors.publishedYear && (
            <p className="mt-1 text-sm text-red-600">{errors.publishedYear.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Жанр *
          </label>
          <input
            type="text"
            {...register('genre')}
            className="input-field"
            placeholder="Например: Фантастика"
          />
          {errors.genre && (
            <p className="mt-1 text-sm text-red-600">{errors.genre.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ссылка на обложку (необязательно)
        </label>
        <input
          type="url"
          {...register('coverImageUrl')}
          className="input-field"
          placeholder="https://example.com/cover.jpg"
        />
        {errors.coverImageUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.coverImageUrl.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary py-3"
      >
        {isLoading ? 'Сохранение...' : initialData ? 'Обновить книгу' : 'Добавить книгу'}
      </button>
    </form>
  )
}

export default BookForm