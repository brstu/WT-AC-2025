import React from 'react'
import { Link } from 'react-router-dom'
import { Book } from '../../features/books/booksTypes'

interface BookCardProps {
  book: Book
  onDelete: (id: string) => void
}

const BookCard: React.FC<BookCardProps> = ({ book, onDelete }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{book.title}</h3>
          <p className="text-gray-600">Автор: {book.author}</p>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-1 text-sm bg-primary-100 text-primary-800 rounded">
            {book.genre}
          </span>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-3">{book.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Год: {book.publishedYear}
          {book.rating && (
            <span className="ml-4">
              ★ {book.rating.toFixed(1)}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Link
            to={`/books/${book.id}`}
            className="btn-secondary text-sm"
          >
            Подробнее
          </Link>
          
          <Link
            to={`/books/${book.id}/edit`}
            className="btn-primary text-sm"
          >
            Редактировать
          </Link>
          
          <button
            onClick={() => onDelete(book.id)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookCard