import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import EventCard from '../components/common/EventCard'

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Тестовое мероприятие',
    description: 'Это тестовое описание мероприятия',
    date: '2024-12-31T12:00:00.000Z',
    location: 'Тестовое место',
    category: 'Конференция',
    maxParticipants: 100,
    currentParticipants: 50,
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
  
  const mockOnDelete = vi.fn()
  
  it('рендерит информацию о мероприятии', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Тестовое мероприятие')).toBeInTheDocument()
    expect(screen.getByText('Это тестовое описание мероприятия')).toBeInTheDocument()
    expect(screen.getByText(/тестовое место/i)).toBeInTheDocument()
    expect(screen.getByText(/конференция/i)).toBeInTheDocument()
    expect(screen.getByText(/50\/100/i)).toBeInTheDocument()
    expect(screen.getByText(/активно/i)).toBeInTheDocument()
  })
  
  it('содержит ссылки на детали и редактирование', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    )
    
    const detailLink = screen.getByRole('link', { name: /подробнее/i })
    const editLink = screen.getByRole('link', { name: /редактировать/i })
    
    expect(detailLink).toHaveAttribute('href', '/events/1')
    expect(editLink).toHaveAttribute('href', '/events/1/edit')
  })
  
  it('отображает кнопку удаления когда передана функция', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} onDelete={mockOnDelete} />
      </BrowserRouter>
    )
    
    expect(screen.getByRole('button', { name: /удалить/i })).toBeInTheDocument()
  })
  
  it('не отображает кнопку удаления когда функция не передана', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    )
    
    expect(screen.queryByRole('button', { name: /удалить/i })).not.toBeInTheDocument()
  })
  
  it('правильно форматирует дату', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    )
    
    // Проверяем, что дата отформатирована по-русски
    const dateElement = screen.getByText(/31 декабря 2024/i)
    expect(dateElement).toBeInTheDocument()
  })
  
  it('показывает правильный цвет статуса', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    )
    
    const statusElement = screen.getByText(/активно/i)
    expect(statusElement).toHaveClass('status-success')
  })
  
  it('показывает правильный цвет для отмененного мероприятия', () => {
    const cancelledEvent = { ...mockEvent, status: 'cancelled' }
    
    render(
      <BrowserRouter>
        <EventCard event={cancelledEvent} />
      </BrowserRouter>
    )
    
    const statusElement = screen.getByText(/отменено/i)
    expect(statusElement).toHaveClass('status-danger')
  })
})