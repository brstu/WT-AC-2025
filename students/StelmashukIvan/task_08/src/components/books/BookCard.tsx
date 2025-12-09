import React from 'react'
import { Link } from 'react-router-dom'
import { Book } from '../../features/books/booksTypes'

interface BookCardProps {
  book: Book
  onDelete: (id: string) => void
}

const BookCard: React.FC<BookCardProps> = ({ book, onDelete }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow" data-testid="book-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900" data-testid="book-title">
            {book.title}
          </h3>
          <p className="text-gray-600" data-testid="book-author">
            Автор: {book.author}
          </p>
        </div>
        <div className="text-right">
          <span 
            className="inline-block px-2 py-1 text-sm bg-primary-100 text-primary-800 rounded"
            data-testid="book-genre"
          >
            {book.genre}
          </span>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-3" data-testid="book-description">
        {book.description}
      </p>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <span data-testid="book-year">Год: {book.publishedYear}</span>
          {book.rating && (
            <span className="ml-4" data-testid="book-rating">
              ★ {book.rating.toFixed(1)}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Link
            to={`/books/${book.id}`}
            className="btn-secondary text-sm"
            data-testid="view-details-button"
          >
            Подробнее
          </Link>
          
          <Link
            to={`/books/${book.id}/edit`}
            className="btn-primary text-sm"
            data-testid="edit-book-button"
          >
            Редактировать
          </Link>
          
          <button
            onClick={() => onDelete(book.id)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            data-testid="delete-book-button"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookCard