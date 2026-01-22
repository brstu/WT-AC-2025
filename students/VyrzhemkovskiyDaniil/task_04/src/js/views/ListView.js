async function ListView({ params, query }) {
  const app = document.getElementById('app');
  app.innerHTML = Loading();

  try {
    const movies = await movieApi.getList();
    console.log('Загружено фильмов:', movies.length);
    
    const search = (query.get('search') || '').toLowerCase();
    const genreFilter = query.get('genre');

    let filtered = movies;
    if (search) {
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(search) || 
        (movie.director && movie.director.toLowerCase().includes(search)) ||
        (movie.description && movie.description.toLowerCase().includes(search)) ||
        (movie.genre && movie.genre.toLowerCase().includes(search))
      );
    }
    if (genreFilter) {
      filtered = filtered.filter(movie => 
        movie.genre && movie.genre.toLowerCase().includes(genreFilter.toLowerCase())
      );
    }

    // Получаем все уникальные жанры
    const allGenres = [...new Set(
      movies.flatMap(movie => 
        movie.genre ? movie.genre.split(',').map(g => g.trim()) : []
      )
    )].filter(Boolean);

    app.innerHTML = `
      <div class="controls">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Поиск по названию, режиссеру или жанру..." 
          value="${search}" 
          id="search-input" 
        />
      </div>

      ${allGenres.length > 0 ? `
        <div class="genres-filter" style="margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${allGenres.map(genre => `
            <span class="genre-badge ${genreFilter === genre ? 'active' : ''}" data-genre="${genre}" 
                  style="cursor: pointer; background: ${genreFilter === genre ? '#8b5cf6' : '#2a2a3e'}; 
                         color: ${genreFilter === genre ? 'white' : '#a78bfa'}; 
                         padding: 0.3rem 0.7rem; border-radius: 6px; font-size: 0.85rem;">
              ${genre}
            </span>
          `).join('')}
        </div>
      ` : ''}

      ${filtered.length === 0 ? Empty(
        'Фильмы не найдены',
        'Добавить фильм',
        '#/new'
      ) : `
        <div class="movies-grid">
          ${filtered.map(movie => `
            <div class="movie-card">
              <div class="movie-card-content">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-info">
                  <div><i>Режиссер:</i> ${movie.director || 'Не указан'}</div>
                  <div><i>Год:</i> ${movie.year || 'Не указан'}</div>
                  <div><i>Жанр:</i> ${movie.genre || 'Не указан'}</div>
                  <div><i>Рейтинг:</i> <span class="rating-badge">${movie.rating || '0'}/10</span></div>
                </div>
                <p class="movie-description">${movie.description || 'Описание отсутствует'}</p>
                <div class="movie-actions">
                  <a href="#/movies/${movie.id}" class="btn-secondary" style="flex: 2">Подробнее</a>
                  <a href="#/movies/${movie.id}/edit" class="btn-edit">Изменить</a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;

    // Обработка поиска
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const val = e.target.value;
          location.hash = val ? `#/movies?search=${encodeURIComponent(val)}` : '#/movies';
        }, 300);
      });
    }

    // Обработка фильтра по жанрам
    document.querySelectorAll('.genre-badge[data-genre]').forEach(el => {
      el.addEventListener('click', () => {
        const genre = el.dataset.genre;
        const currentHash = window.location.hash;
        const basePath = currentHash.split('?')[0];
        const params = new URLSearchParams(currentHash.split('?')[1] || '');
        
        if (genreFilter === genre) {
          params.delete('genre');
        } else {
          params.set('genre', genre);
        }
        
        const newHash = params.toString() ? `${basePath}?${params.toString()}` : basePath;
        location.hash = newHash;
      });
    });

  } catch (err) {
    console.error('Ошибка в ListView:', err);
    app.innerHTML = ErrorMessage(err.message);
    Toast.error("Ошибка загрузки списка фильмов");
  }
}