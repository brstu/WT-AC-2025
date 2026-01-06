async function DetailView({ params, query }) {
  const app = document.getElementById('app');
  app.innerHTML = Loading();

  try {
    const movie = await movieApi.getItem(params.id);
    console.log('Загружен фильм:', movie.title);

    // Форматирование жанров
    const genres = movie.genre ? 
      movie.genre.split(',').map(g => `<span class="genre-badge">${g.trim()}</span>`).join('') : 
      '<span class="genre-badge">Не указан</span>';

    app.innerHTML = `
      <div class="detail-view">
        <a href="#/movies" class="back-btn">← Назад к списку фильмов</a>
        
        <div class="detail-header">
          <div>
            <h1 class="detail-title">${movie.title}</h1>
            <div class="detail-meta">
              <div><strong>Режиссер:</strong> ${movie.director || 'Не указан'}</div>
              <div><strong>Год выпуска:</strong> ${movie.year || 'Не указан'}</div>
              <div><strong>Продолжительность:</strong> ${movie.duration || 'Не указана'}</div>
              <div><strong>Рейтинг:</strong> <span class="rating-badge">${movie.rating || '0'}/10</span></div>
              <div><strong>Жанры:</strong> ${genres}</div>
            </div>
          </div>
        </div>
        
        <div class="detail-content">
          <div>
            <h3 style="color: #fff; margin-bottom: 1rem; font-size: 1.3rem;">Описание</h3>
            <p class="detail-description">${movie.description || 'Описание отсутствует'}</p>
          </div>
          
          <div class="detail-sidebar">
            <h3 style="color: #fff; margin-bottom: 1rem;">Дополнительная информация</h3>
            <div style="color: #b0b0c0; line-height: 1.6;">
              <div style="margin-bottom: 0.5rem;"><strong>Страна:</strong> ${movie.country || 'Не указана'}</div>
              <div style="margin-bottom: 0.5rem;"><strong>Язык:</strong> ${movie.language || 'Не указан'}</div>
              <div style="margin-bottom: 0.5rem;"><strong>Бюджет:</strong> ${movie.budget || 'Не указан'}</div>
              <div><strong>Сборы:</strong> ${movie.boxOffice || 'Не указаны'}</div>
              ${movie.createdAt ? `<div style="margin-top: 1rem; font-size: 0.9rem; color: #888;"><strong>Добавлен:</strong> ${new Date(movie.createdAt).toLocaleDateString()}</div>` : ''}
            </div>
            
            <div class="detail-actions">
              <a href="#/movies" class="btn-secondary">Назад к списку</a>
              <a href="#/movies/${movie.id}/edit" class="btn-edit">Редактировать</a>
              <button class="btn-delete" id="delete-btn">Удалить фильм</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('delete-btn').addEventListener('click', async () => {
      if (confirm('Вы уверены, что хотите удалить этот фильм?')) {
        try {
          await movieApi.remove(params.id);
          Toast.success('Фильм удалён');
          location.hash = '#/movies';
        } catch (err) {
          Toast.error('Ошибка при удалении');
        }
      }
    });

  } catch (err) {
    app.innerHTML = ErrorMessage("Фильм не найден или произошла ошибка");
    Toast.error("Ошибка загрузки");
  }
}