import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetBookQuery, useUpdateBookMutation } from '../features/books/booksApi'
import BookForm from '../components/books/BookForm'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import type { BookFormData } from '../features/books/booksTypes'

const BookEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: book, isLoading, error } = useGetBookQuery(id!)
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation()

  const handleSubmit = async (data: BookFormData) => {
    await updateBook({ id: id!, data }).unwrap()
    navigate(`/books/${id}`)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Книга не найдена" />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Редактировать книгу</h1>
        <p className="text-gray-600 mt-2">Измените информацию о книге</p>
      </div>
      
      <BookForm
        onSubmit={handleSubmit}
        initialData={book}
        isLoading={isUpdating}
      />
    </div>
  )
}

export default BookEditPage