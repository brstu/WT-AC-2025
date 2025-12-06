import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateBookMutation } from '../features/books/booksApi'
import BookForm from '../components/books/BookForm'
import type { BookFormData } from '../features/books/booksTypes'

const BookCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [createBook, { isLoading }] = useCreateBookMutation()

  const handleSubmit = async (data: BookFormData) => {
    await createBook(data).unwrap()
    navigate('/books')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Добавить новую книгу</h1>
        <p className="text-gray-600 mt-2">Заполните информацию о книге</p>
      </div>
      
      <BookForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}

export default BookCreatePage