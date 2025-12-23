import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FilmCard } from '../src/FilmCard.js';

const mockFilm = {
  id: 1,
  title: 'Интерстеллар',
  director: 'Кристофер Нолан',
  year: 2014,
  rating: 8.6,
};

describe('FilmCard Component', () => {
  test('отображает информацию о фильме', () => {
    const handleBookmark = jest.fn();
    render(<FilmCard film={mockFilm} onBookmark={handleBookmark} />);
    
    expect(screen.getByText('Интерстеллар')).toBeInTheDocument();
    expect(screen.getByText('Режиссер: Кристофер Нолан')).toBeInTheDocument();
  });

  test('вызывает onBookmark при клике на кнопку', () => {
    const handleBookmark = jest.fn();
    render(<FilmCard film={mockFilm} onBookmark={handleBookmark} />);
    
    fireEvent.click(screen.getByText('📌 В закладки'));
    expect(handleBookmark).toHaveBeenCalledWith(mockFilm);
  });
});