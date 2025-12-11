import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import BookCard from '../books/BookCard'

const mockBook = {
  id: '1',
  title: 'Test Book',
  author: 'Test Author',
  description: 'Test Description',
  publishedYear: 2023,
  genre: 'Test Genre',
  rating: 4.5,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01',
}

const mockStore = configureStore({
  reducer: {
    books: () => ({ favorites: [], recentlyViewed: [], searchHistory: [] }),
  },
})

describe('BookCard', () => {
  test('renders book information correctly', () => {
    render(
      <Provider store={mockStore}>
        <BookCard book={mockBook} onDelete={() => {}} />
      </Provider>
    )

    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Автор: Test Author')).toBeInTheDocument()
    expect(screen.getByText('Test Genre')).toBeInTheDocument()
    expect(screen.getByText('Год: 2023')).toBeInTheDocument()
  })

  test('calls onDelete when delete button is clicked', () => {
    const handleDelete = jest.fn()
    
    render(
      <Provider store={mockStore}>
        <BookCard book={mockBook} onDelete={handleDelete} />
      </Provider>
    )

    const deleteButton = screen.getByText('Удалить')
    fireEvent.click(deleteButton)
    
    expect(handleDelete).toHaveBeenCalledWith('1')
  })
})