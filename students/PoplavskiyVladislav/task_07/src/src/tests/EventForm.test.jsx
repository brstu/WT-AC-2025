import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EventForm from '../components/events/EventForm'

// Mock хуков
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn) => (e) => {
      e.preventDefault()
      fn({
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-31T12:00',
        location: 'Test Location',
        category: 'Конференция',
        maxParticipants: 100,
        status: 'active'
      })
    }),
    formState: {
      errors: {}
    }
  }),
  Controller: vi.fn()
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn()
}))

describe('EventForm', () => {
  const mockSubmit = vi.fn()
  
  beforeEach(() => {
    mockSubmit.mockClear()
  })
  
  it('рендерит форму с правильными полями', () => {
    render(<EventForm onSubmit={mockSubmit} />)
    
    expect(screen.getByLabelText(/название мероприятия/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/дата и время/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/место проведения/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/категория/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/максимум участников/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/статус/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /создать/i })).toBeInTheDocument()
  })
  
  it('изменяет текст кнопки при редактировании', () => {
    const initialData = { id: '1', title: 'Existing Event' }
    render(<EventForm onSubmit={mockSubmit} initialData={initialData} />)
    
    expect(screen.getByRole('button', { name: /обновить/i })).toBeInTheDocument()
  })
  
  it('отключает кнопку при загрузке', () => {
    render(<EventForm onSubmit={mockSubmit} isSubmitting={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent(/сохранение/i)
  })
  
  it('отображает поля с начальными данными', () => {
    const initialData = {
      title: 'Existing Event',
      description: 'Existing Description',
      date: '2024-12-31T12:00',
      location: 'Existing Location',
      category: 'Конференция',
      maxParticipants: 50,
      status: 'active'
    }
    
    render(<EventForm onSubmit={mockSubmit} initialData={initialData} />)
    
    expect(screen.getByDisplayValue('Existing Event')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Location')).toBeInTheDocument()
    expect(screen.getByDisplayValue('50')).toBeInTheDocument()
  })
  
  it('вызывает onSubmit при отправке формы', () => {
    render(<EventForm onSubmit={mockSubmit} />)
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    expect(mockSubmit).toHaveBeenCalledTimes(1)
    expect(mockSubmit).toHaveBeenCalledWith({
      title: 'Test Event',
      description: 'Test Description',
      date: '2024-12-31T12:00',
      location: 'Test Location',
      category: 'Конференция',
      maxParticipants: 100,
      status: 'active'
    })
  })
  
  it('отображает ошибки валидации', () => {
    // Mock ошибок валидации
    vi.mock('react-hook-form', () => ({
      useForm: () => ({
        register: vi.fn(),
        handleSubmit: vi.fn(),
        formState: {
          errors: {
            title: { message: 'Название обязательно' },
            description: { message: 'Описание слишком короткое' }
          }
        }
      }),
      Controller: vi.fn()
    }))
    
    render(<EventForm onSubmit={mockSubmit} />)
    
    expect(screen.getByText(/название обязательно/i)).toBeInTheDocument()
    expect(screen.getByText(/описание слишком короткое/i)).toBeInTheDocument()
  })
  
  it('содержит правильные опции категорий', () => {
    render(<EventForm onSubmit={mockSubmit} />)
    
    const select = screen.getByLabelText(/категория/i)
    expect(select).toContainHTML('<option value="">Выберите категорию</option>')
    expect(select).toContainHTML('<option value="Конференция">Конференция</option>')
    expect(select).toContainHTML('<option value="Семинар">Семинар</option>')
    expect(select).toContainHTML('<option value="Воркшоп">Воркшоп</option>')
  })
})