import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { HomePage } from '.'
import { adsApi } from '../../app/api'

// Мок данных
const mockAds = {
  ads: [
    {
      id: '1',
      title: 'Test Ad 1',
      description: 'Test Description 1',
      price: 1000,
      category: { id: '1', name: 'Electronics', slug: 'electronics', icon: '💻' },
      images: ['image1.jpg'],
      location: 'Moscow',
      user: { id: '1', name: 'John Doe', email: 'john@test.com' },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      views: 100,
      isActive: true
    }
  ],
  total: 1
}

const mockStore = configureStore({
  reducer: {
    [adsApi.reducerPath]: adsApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adsApi.middleware)
})

vi.mock('../../app/api', async () => {
  const actual = await vi.importActual('../../app/api')
  return {
    ...actual,
    useGetAdsQuery: () => ({
      data: mockAds,
      isLoading: false,
      error: null
    }),
    useGetCategoriesQuery: () => ({
      data: [],
      isLoading: false
    })
  }
})

describe('HomePage', () => {
  it('отображает заголовок страницы', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Ad 1')).toBeInTheDocument()
    })
  })

  it('отображает кнопку поиска', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByPlaceholderText('Поиск объявлений...')).toBeInTheDocument()
  })
})
