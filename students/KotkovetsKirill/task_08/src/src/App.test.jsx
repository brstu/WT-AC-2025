import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'


describe('App', () => {
  it('renders title', () => {
    render(<App />)
    const title = screen.getByText(/Справочник кофеен/i)
    expect(title).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(<App />)
    const footer = screen.getByText(/© 2025/i)
    expect(footer).toBeInTheDocument()
  })
})
