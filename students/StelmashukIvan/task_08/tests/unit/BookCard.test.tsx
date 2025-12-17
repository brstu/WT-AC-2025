import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import BookCard from '../../src/components/books/BookCard'

const mockBook = {
  id: '1',
  title: 'Test Book',
  author: 'Test Author',
  description: 'Test description for the book',
  publishedYear: 2023,
  genre: 'Fiction',
  rating: 4.5,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
}

const createMockStore = () => {
  return configureStore({
    reducer: {
      books: () => ({ 
        favorites: [], 
        recentlyViewed: [], 
        searchHistory: [] 
      }),
    },
  })
}

describe('BookCard Component', () => {
  const mockOnDelete = vi.fn()

  it('renders book information correctly', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BookCard book={mockBook} onDelete={mockOnDelete} />
        </BrowserRouter>
      </Provider>
    )
    
    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Автор: Test Author')).toBeInTheDocument()
    expect(screen.getByText('Fiction')).toBeInTheDocument()
    expect(screen.getByText('Год: 2023')).toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BookCard book={mockBook} onDelete={mockOnDelete} />
        </BrowserRouter>
      </Provider>
    )
    
    const deleteButton = screen.getByText('Удалить')
    fireEvent.click(deleteButton)
    
    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('shows correct rating stars', () => {
    const store = createMockStore()
    const bookWithoutRating = { ...mockBook, rating: undefined }
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BookCard book={bookWithoutRating} onDelete={mockOnDelete} />
        </BrowserRouter>
      </Provider>
    )
    
    // Проверяем, что рейтинг не отображается, если его нет
    const ratingElement = screen.queryByText('★')
    expect(ratingElement).not.toBeInTheDocument()
  })
})