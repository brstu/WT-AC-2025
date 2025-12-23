import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { FilmCard } from './FilmCard.js';
import { fetchFilms } from './api.js';

const App = () => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilms = async () => {
      setLoading(true);
      const data = await fetchFilms();
      setFilms(data);
      setLoading(false);
    };
    loadFilms();
  }, []);

  const handleBookmark = (film) => {
    alert(`"${film.title}" добавлен в закладки!`);
  };

  return (
    <div className="app" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎬 Фильмы фестиваля</h1>
      
      {loading ? (
        <p>Загрузка фильмов...</p>
      ) : (
        <div className="films-list" style={{ display: 'grid', gap: '20px' }}>
          {films.map(film => (
            <div key={film.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <FilmCard film={film} onBookmark={handleBookmark} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

if (!document.getElementById('root')) {
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}