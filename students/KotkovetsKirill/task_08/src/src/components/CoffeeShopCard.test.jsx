import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CoffeeShopCard from './CoffeeShopCard'

describe('CoffeeShopCard', () => {
  const shop = {
    id: 1,
    name: 'Test Shop',
    address: 'Test Address',
    image: 'test.jpg',
    rating: 4,
    description: 'Test Description'
  }

  it('shows shop name', () => {
    render(<CoffeeShopCard shop={shop} />)
    expect(screen.getByText('Test Shop')).toBeInTheDocument()
  })

  it('shows button', () => {
    render(<CoffeeShopCard shop={shop} />)
    const btn = screen.getByText('Подробнее')
    expect(btn).toBeInTheDocument()
  })
})
