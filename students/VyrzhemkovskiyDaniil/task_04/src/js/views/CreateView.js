async function CreateView({ params, query }) {
  const app = document.getElementById('app');
  app.innerHTML = Loading();

  try {
    app.innerHTML = `
      <h2 style="text-align:center; margin-bottom:2rem; color:#e0e0e0;">Добавить новый фильм</h2>
      <form id="create-form">
        <input name="title" placeholder="Название фильма*" required minlength="2" />
        <input name="director" placeholder="Режиссер" />
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <input name="year" type="number" placeholder="Год выпуска" min="1888" max="${new Date().getFullYear() + 5}" />
          <input name="rating" type="number" step="0.1" placeholder="Рейтинг (0-10)" min="0" max="10" />
        </div>
        
        <input name="genre" placeholder="Жанры через запятую: Драма, Комедия, Фантастика" />
        <input name="duration" placeholder="Продолжительность (например: 2ч 28мин)" />
        
        <textarea name="description" placeholder="Описание фильма*" required minlength="10" rows="4"></textarea>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <input name="country" placeholder="Страна" />
          <input name="language" placeholder="Язык" />
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <input name="budget" placeholder="Бюджет (например: $160 млн)" />
          <input name="boxOffice" placeholder="Сборы (например: $836.8 млн)" />
        </div>

        <p id="form-error" style="color:#ef4444; display:none; margin-top:1rem;"></p>

        <div class="form-actions">
          <a href="#/movies" class="btn-secondary">← Назад</a>
          <button type="submit" class="btn-primary">
            <span class="btn-text">Добавить фильм</span>
            <span class="btn-loading" style="display:none;">Добавление...</span>
          </button>
        </div>
      </form>
    `;

    const form = document.getElementById('create-form');
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
        await movieApi.create(data);
        Toast.success("Фильм успешно добавлен!");
        setTimeout(() => {
          location.hash = "#/movies";
        }, 1000);
      } catch (err) {
        console.error(err);
        Toast.error("Ошибка добавления фильма");
        errorEl.textContent = 'Произошла ошибка при сохранении';
        errorEl.style.display = 'block';
      } finally {
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
      }
    });
  } catch (err) {
    app.innerHTML = ErrorMessage("Не удалось загрузить форму");
    Toast.error("Ошибка загрузки");
  }
}