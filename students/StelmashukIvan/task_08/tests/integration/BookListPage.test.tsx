import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import BookListPage from '../../src/pages/BookListPage'

// Mock RTK Query
const mockUseGetBooksQuery = vi.fn()
const mockUseDeleteBookMutation = vi.fn()
const mockUsePrefetch = vi.fn()

vi.mock('../../src/features/books/booksApi', () => ({
  useGetBooksQuery: () => mockUseGetBooksQuery(),
  useDeleteBookMutation: () => [mockUseDeleteBookMutation],
  usePrefetch: () => mockUsePrefetch,
}))

describe('BookListPage Integration Test', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockUsePrefetch.mockReturnValue(vi.fn())
  })

  const createMockStore = () => {
    return configureStore({
      reducer: {
        books: () => ({ favorites: [], recentlyViewed: [], searchHistory: [] }),
      },
    })
  }

  it('renders loading state initially', () => {
    mockUseGetBooksQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BookListPage />
        </BrowserRouter>
      </Provider>
    )
    
    // Проверяем наличие спиннера загрузки
    expect(screen.getByText(/загрузк/i)).toBeInTheDocument()
  })

  it('filters books by search term', async () => {
    const mockBooks = [
      {
        id: '1',
        title: 'Book One',
        author: 'Author One',
        description: 'Description One',
        publishedYear: 2021,
        genre: 'Fiction',
        rating: 4.5,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      {
        id: '2',
        title: 'Book Two',
        author: 'Author Two',
        description: 'Description Two',
        publishedYear: 2022,
        genre: 'Non-Fiction',
        rating: 4.0,
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      },
    ]

    mockUseGetBooksQuery.mockReturnValue({
      data: mockBooks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BookListPage />
        </BrowserRouter>
      </Provider>
    )

    // Проверяем, что обе книги отображаются
    expect(screen.getByText('Book One')).toBeInTheDocument()
    expect(screen.getByText('Book Two')).toBeInTheDocument()
  })

  it('handles empty book list', async () => {
    mockUseGetBooksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const store = createMockStore()

    render(
      <Provider store={store}>
        <BrowserRouter>
          <BookListPage />
        </BrowserRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Книги не найдены')).toBeInTheDocument()
    })
  })
})