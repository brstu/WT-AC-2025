import React, { useState } from 'react'
import { useGetBooksQuery, useDeleteBookMutation } from '../features/books/booksApi'
import BookCard from '../components/books/BookCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { usePrefetch } from '../features/books/booksApi'

const BookListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  
  const { 
    data: books, 
    isLoading, 
    error, 
    refetch 
  } = useGetBooksQuery()
  
  const [deleteBook] = useDeleteBookMutation()
  const prefetchBook = usePrefetch('getBook')

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
      await deleteBook(id)
    }
  }

  const handleMouseEnter = (id: string) => {
    prefetchBook(id)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Ошибка загрузки книг" retry={refetch} />

  const filteredBooks = books?.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = !genreFilter || book.genre === genreFilter
    return matchesSearch && matchesGenre
  })

  const genres = [...new Set(books?.map(book => book.genre) || [])]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Каталог книг</h1>
        <a
          href="/books/new"
          className="btn-primary"
        >
          Добавить книгу
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <input
            type="text"
            placeholder="Поиск по названию или автору..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        
        <div>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Все жанры</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
        
        <div className="text-gray-600">
          Найдено книг: {filteredBooks?.length || 0}
        </div>
      </div>

      {filteredBooks?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Книги не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks?.map(book => (
            <div
              key={book.id}
              onMouseEnter={() => handleMouseEnter(book.id)}
            >
              <BookCard
                book={book}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookListPage