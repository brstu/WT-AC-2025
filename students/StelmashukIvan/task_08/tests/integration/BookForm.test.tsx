import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import BookForm from '../../src/components/books/BookForm'
import type { BookFormData } from '../../src/features/books/booksTypes'

describe('BookForm Integration Test', () => {
  const mockOnSubmit = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form with initial data', () => {
    const initialData: BookFormData = {
      title: 'Initial Title',
      author: 'Initial Author',
      description: 'Initial description',
      publishedYear: 2020,
      genre: 'Initial Genre',
    }

    render(
      <BrowserRouter>
        <BookForm onSubmit={mockOnSubmit} initialData={initialData} />
      </BrowserRouter>
    )

    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Initial Author')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Initial description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Initial Genre')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(
      <BrowserRouter>
        <BookForm onSubmit={mockOnSubmit} />
      </BrowserRouter>
    )

    const submitButton = screen.getByText('Добавить книгу')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Название обязательно/)).toBeInTheDocument()
      expect(screen.getByText(/Автор обязателен/)).toBeInTheDocument()
      expect(screen.getByText(/Описание должно содержать минимум 10 символов/)).toBeInTheDocument()
      expect(screen.getByText(/Жанр обязателен/)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(
      <BrowserRouter>
        <BookForm onSubmit={mockOnSubmit} />
      </BrowserRouter>
    )

    // Заполняем форму
    fireEvent.change(screen.getByPlaceholderText('Введите название книги'), {
      target: { value: 'New Book' },
    })
    
    fireEvent.change(screen.getByPlaceholderText('Введите имя автора'), {
      target: { value: 'New Author' },
    })
    
    fireEvent.change(screen.getByPlaceholderText('Опишите книгу'), {
      target: { value: 'This is a valid book description that meets the minimum length requirement' },
    })
    
    fireEvent.change(screen.getByPlaceholderText('Например: Фантастика'), {
      target: { value: 'Fantasy' },
    })

    const yearInput = screen.getByRole('spinbutton')
    fireEvent.change(yearInput, {
      target: { value: '2023' },
    })

    const submitButton = screen.getByText('Добавить книгу')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Book',
        author: 'New Author',
        description: 'This is a valid book description that meets the minimum length requirement',
        publishedYear: 2023,
        genre: 'Fantasy',
        coverImageUrl: '',
      })
    })
  })

  it('shows loading state', () => {
    render(
      <BrowserRouter>
        <BookForm onSubmit={mockOnSubmit} isLoading={true} />
      </BrowserRouter>
    )

    expect(screen.getByText('Сохранение...')).toBeInTheDocument()
    expect(screen.getByText('Сохранение...')).toBeDisabled()
  })
})