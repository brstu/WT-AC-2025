import React from 'react';

export const FilmCard = ({ film, onBookmark }) => {
  if (!film) return null;
  
  return (
    <div className="film-card" data-testid={`film-card-${film.id}`}>
      <h3>{film.title}</h3>
      <p>Режиссер: {film.director}</p>
      <p>Год: {film.year}</p>
      <p>Рейтинг: ⭐ {film.rating}/10</p>
      <button 
        onClick={() => onBookmark && onBookmark(film)}
        data-testid={`bookmark-btn-${film.id}`}
      >
        📌 В закладки
      </button>
    </div>
  );
};