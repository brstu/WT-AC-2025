async function EditView({ params, query }) {
  const app = document.getElementById('app');
  app.innerHTML = Loading();

  try {
    const movie = await movieApi.getItem(params.id);

    app.innerHTML = `
      <h2 style="text-align:center; margin-bottom:2rem; color:#e0e0e0;">Редактировать фильм</h2>
      <form id="edit-form">
        <input name="title" value="${movie.title || ''}" placeholder="Название фильма*" required minlength="2" />
        <input name="director" value="${movie.director || ''}" placeholder="Режиссер" />
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <input name="year" type="number" value="${movie.year || ''}" placeholder="Год выпуска" min="1888" max="${new Date().getFullYear() + 5}" />
          <input name="rating" type="number" step="0.1" value="${movie.rating || ''}" placeholder="Рейтинг (0-10)" min="0" max="10" />
        </div>
        
        <input name="genre" value="${movie.genre || ''}" placeholder="Жанры через запятую: Драма, Комедия, Фантастика" />
        <input name="duration" value="${movie.duration || ''}" placeholder="Продолжительность (например: 2ч 28мин)" />
        
        <textarea name="description" placeholder="Описание фильма*" required minlength="10" rows="4">${movie.description || ''}</textarea>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <input name="country" value="${movie.country || ''}" placeholder="Страна" />
          <input name="language" value="${movie.language || ''}" placeholder="Язык" />
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <input name="budget" value="${movie.budget || ''}" placeholder="Бюджет (например: $160 млн)" />
          <input name="boxOffice" value="${movie.boxOffice || ''}" placeholder="Сборы (например: $836.8 млн)" />
        </div>

        <p id="form-error" style="color:#ef4444; display:none; margin-top:1rem;"></p>

        <div class="form-actions">
          <a href="#/movies/${params.id}" class="btn-secondary">← Назад</a>
          <button type="submit" class="btn-primary">
            <span class="btn-text">Сохранить изменения</span>
            <span class="btn-loading" style="display:none;">Сохранение...</span>
          </button>
        </div>
      </form>
    `;

    const form = document.getElementById('edit-form');
    const errorEl = document.getElementById('form-error');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      errorEl.style.display = 'none';
      errorEl.textContent = '';

      const fd = new FormData(e.target);
      let data = Object.fromEntries(fd.entries());

      // Валидация
      if (!data.title?.trim() || data.title.trim().length < 2) {
        errorEl.textContent = 'Название фильма должно быть не короче 2 символов';
        errorEl.style.display = 'block';
        return;
      }
      if (!data.description?.trim() || data.description.trim().length < 10) {
        errorEl.textContent = 'Описание должно быть не короче 10 символов';
        errorEl.style.display = 'block';
        return;
      }
      if (data.rating && (data.rating < 0 || data.rating > 10)) {
        errorEl.textContent = 'Рейтинг должен быть от 0 до 10';
        errorEl.style.display = 'block';
        return;
      }

      // Обработка данных
      data = {
        title: data.title.trim(),
        director: data.director?.trim() || 'Не указан',
        year: data.year ? parseInt(data.year) : null,
        rating: data.rating ? parseFloat(data.rating) : null,
        genre: data.genre?.trim() || 'Не указан',
        duration: data.duration?.trim() || 'Не указана',
        description: data.description.trim(),
        country: data.country?.trim() || 'Не указана',
        language: data.language?.trim() || 'Не указан',
        budget: data.budget?.trim() || 'Не указан',
        boxOffice: data.boxOffice?.trim() || 'Не указаны'
      };

      const btn = e.target.querySelector('.btn-primary');
      const btnText = btn.querySelector('.btn-text');
      const btnLoading = btn.querySelector('.btn-loading');

      btn.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';

      try {
        await movieApi.update(params.id, data);
        Toast.success("Изменения сохранены!");
        setTimeout(() => {
          location.hash = `#/movies/${params.id}`;
        }, 1000);
      } catch (err) {
        console.error("Ошибка обновления:", err);
        Toast.error("Ошибка сохранения");
        errorEl.textContent = 'Не удалось сохранить изменения';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
      }
    });

  } catch (err) {
    app.innerHTML = ErrorMessage("Не удалось загрузить фильм для редактирования");
    Toast.error("Ошибка загрузки");
  }
}