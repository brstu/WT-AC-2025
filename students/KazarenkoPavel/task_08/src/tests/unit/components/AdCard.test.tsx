import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdCard } from '@/components/ads/AdCard'
import { MemoryRouter } from 'react-router-dom'

const mockAd = {
  id: '1',
  title: 'Test iPhone',
  description: 'Brand new iPhone 14',
  price: 999,
  category: { id: '1', name: 'Electronics', slug: 'electronics', icon: '📱' },
  images: ['/test-image.jpg'],
  location: 'Moscow',
  user: { id: '1', name: 'John Doe', email: 'test@test.com' },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  views: 100,
  isActive: true,
}

describe('AdCard Component', () => {
  it('отображает заголовок и цену объявления', () => {
    render(
      <MemoryRouter>
        <AdCard ad={mockAd} />
      </MemoryRouter>
    )

    expect(screen.getByText('Test iPhone')).toBeInTheDocument()
    expect(screen.getByText('999 ₽')).toBeInTheDocument()
  })

  it('отображает местоположение и категорию', () => {
    render(
      <MemoryRouter>
        <AdCard ad={mockAd} />
      </MemoryRouter>
    )

    expect(screen.getByText('Moscow')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('переходит на страницу деталей при клике', () => {
    render(
      <MemoryRouter>
        <AdCard ad={mockAd} />
      </MemoryRouter>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/ad/1')
  })
})
