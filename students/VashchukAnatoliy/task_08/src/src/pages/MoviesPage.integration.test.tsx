import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import MoviesPage from './MoviesPage'
import { configureStore } from '@reduxjs/toolkit'

/* ======================
   МОКИ
====================== */

// RTK Query hooks
vi.mock('../shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../shared/api')>()

  return {
    ...actual,

    api: {
      ...actual.api,
      usePrefetch: () => vi.fn(),
    },

    useGetMoviesQuery: () => ({
      data: {
        data: [
          {
            id: '1',
            title: 'Test Movie',
            description: 'Test description',
            year: 2024,
            rating: 8.5,
            posterUrl: '',
            createdAt: '',
            updatedAt: '',
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }),

    useDeleteMovieMutation: () => [vi.fn(), { isLoading: false }],
  }
})


// toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// utils — ЧАСТИЧНЫЙ МОК
vi.mock('../shared/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../shared/lib/utils')>()
  return {
    ...actual,
    debounce: (fn: any) => fn,
    cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
  }
})

/* ======================
   STORE
====================== */

const store = configureStore({
  reducer: () => ({}),
})

/* ======================
   TEST
====================== */

describe('MoviesPage (integration)', () => {
  it('renders movies list from API', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <MoviesPage />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByText('Movies Catalog')).toBeInTheDocument()
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})
