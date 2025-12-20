import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('рендерит без ошибок', () => {
    render(<App />)
    expect(screen.getByText(/Каталог художественных работ/i)).toBeDefined()
  })
})
