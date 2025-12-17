import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useGetBookQuery, useDeleteBookMutation } from '../features/books/booksApi'
import { useGetReviewsByBookIdQuery, useCreateReviewMutation } from '../features/reviews/reviewsApi'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import ReviewForm from '../components/books/ReviewForm'
import { reviewSchema } from '../utils/validationSchemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: book, isLoading, error } = useGetBookQuery(id!)
  const { data: reviews, refetch: refetchReviews } = useGetReviewsByBookIdQuery(id!)
  const [deleteBook] = useDeleteBookMutation()
  const [createReview] = useCreateReviewMutation()

  const reviewForm = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      author: '',
      content: '',
      rating: 5,
    },
  })

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
      await deleteBook(id!)
      navigate('/books')
    }
  }

  const handleReviewSubmit = async (data: any) => {
    await createReview({ ...data, bookId: id! })
    reviewForm.reset()
    refetchReviews()
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Книга не найдена" />

  const averageRating = reviews?.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <Link to="/books" className="text-primary-600 hover:text-primary-700">
            ← Назад к списку
          </Link>
          <h1 className="text-3xl font-bold mt-2">{book?.title}</h1>
          <p className="text-xl text-gray-600 mt-1">{book?.author}</p>
        </div>
        
        <div className="flex space-x-4">
          <Link
            to={`/books/${id}/edit`}
            className="btn-primary"
          >
            Редактировать
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {book?.genre}
                </span>
                <span className="ml-4 text-gray-600">
                  Год: {book?.publishedYear}
                </span>
              </div>
              {averageRating > 0 && (
                <div className="text-2xl font-bold text-yellow-500">
                  ★ {averageRating.toFixed(1)}
                </div>
              )}
            </div>
            
            <p className="text-gray-700 mb-6">{book?.description}</p>
            
            <div className="text-sm text-gray-500">
              <p>Добавлено: {format(new Date(book!.createdAt), 'd MMMM yyyy', { locale: ru })}</p>
              {book?.coverImageUrl && (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="mt-4 rounded-lg max-w-sm"
                />
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Рецензии ({reviews?.length || 0})</h2>
            
            <form onSubmit={reviewForm.handleSubmit(handleReviewSubmit)} className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    {...reviewForm.register('author')}
                    className="input-field"
                  />
                  {reviewForm.formState.errors.author && (
                    <p className="text-red-600 text-sm mt-1">
                      {reviewForm.formState.errors.author.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <select
                    {...reviewForm.register('rating', { valueAsNumber: true })}
                    className="input-field"
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 5 ? 'звёзд' : 'звезды'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <textarea
                  placeholder="Ваша рецензия"
                  rows={3}
                  {...reviewForm.register('content')}
                  className="input-field"
                />
                {reviewForm.formState.errors.content && (
                  <p className="text-red-600 text-sm mt-1">
                    {reviewForm.formState.errors.content.message}
                  </p>
                )}
              </div>
              
              <button type="submit" className="btn-primary">
                Добавить рецензию
              </button>
            </form>

            {reviews?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Пока нет рецензий. Будьте первым!</p>
            ) : (
              <div className="space-y-4">
                {reviews?.map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{review.author}</p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(review.createdAt), 'd MMM yyyy', { locale: ru })}
                      </p>
                    </div>
                    <p className="text-gray-700">{review.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetailPage