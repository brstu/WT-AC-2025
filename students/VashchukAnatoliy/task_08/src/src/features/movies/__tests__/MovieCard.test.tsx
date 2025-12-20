import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { MovieCard } from '../MovieCard'
import type { Movie } from '../../../shared/types'

/* =========================
   МОКИ
========================= */

// ✅ RTK Query — ФОРМА ВАЖНЕЕ ЛОГИКИ
vi.mock('../../../shared/api', () => ({
  api: {
    usePrefetch: () => () => {},
  },
}))

// UI components — упрощаем до div
vi.mock('../../../shared/ui', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}))

/* =========================
   TEST DATA
========================= */

const mockMovie: Movie = {
  id: '1',
  title: 'Test Movie',
  description: 'Test description',
  year: 2024,
  rating: 8.5,
  posterUrl: 'https://example.com/poster.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

/* =========================
   TESTS
========================= */

describe('MovieCard', () => {
  it('renders movie title and description', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )

    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})
