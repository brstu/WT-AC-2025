import * as api from './api.js';

const app = document.getElementById('app');

function notify(text) {
  const n = document.getElementById('notification');
  n.textContent = text;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
}

function loading() {
  return '<div class="loading">Загрузка аниме...</div>';
}

export async function listView() {
  app.innerHTML = loading();

  try {
    const anime = await api.getBooks();

    if (anime.length === 0) {
      app.innerHTML = `
        <div class="empty" style="text-align:center;padding:6rem;">
          <p style="font-size:1.6rem;color:var(--text-secondary);">Энциклопедия пуста</p>
          <a href="#/new" class="btn btn-primary" style="margin-top:1.5rem;padding:1rem 2.5rem;font-size:1.1rem;">
            Добавить первый тайтл
          </a>
        </div>`;
      return;
    }

    app.innerHTML = `
      <div class="anime-grid">
        ${anime.map(a => `
          <div class="anime-card">
            <div class="anime-card-content">
              <h3><a href="#/items/${a.id}">${a.title || 'Без названия'}</a></h3>
              <p><strong>Студия:</strong> ${a.studio || '—'}</p>
              <p><strong>Год:</strong> ${a.year || '—'}</p>
              <p><strong>Жанры:</strong> ${a.genres || '—'}</p>
              <p><strong>Эпизоды:</strong> ${a.episodes || '?'} ${a.status ? `• ${a.status}` : ''}</p>
              <div class="anime-actions">
                <button class="btn btn-primary" onclick="location.hash='items/${a.id}/edit'">Редактировать</button>
                <button class="btn btn-danger delete" data-id="${a.id}">Удалить</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>`;

    document.querySelectorAll('.delete').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('Удалить тайтл?')) {
          await api.deleteBook(btn.dataset.id);
          notify('Тайтл удалён');
          listView();
        }
      };
    });

  } catch (e) {
    app.innerHTML = `<div class="error">Ошибка загрузки</div>`;
  }
}

export async function detailView({ params }) {
  app.innerHTML = loading();
  try {
    const anime = await api.getBook(params.id);
    app.innerHTML = `
      <article style="background:var(--surface);padding:3rem;border-radius:var(--radius);box-shadow:var(--shadow);max-width:800px;margin:2rem auto;">
        <h2 style="font-size:2.8rem;margin-bottom:1rem;color:var(--primary);">${anime.title}</h2>
        <p><strong>Студия:</strong> ${anime.studio || '—'}</p>
        <p><strong>Год выпуска:</strong> ${anime.year || '—'}</p>
        <p><strong>Жанры:</strong> ${anime.genres || '—'}</p>
        <p><strong>Эпизоды:</strong> ${anime.episodes || '?'} • <strong>Статус:</strong> ${anime.status || 'Неизвестно'}</p>
        <p style="margin-top:2rem;font-size:1.15rem;line-height:1.8;">${anime.description || 'Описание отсутствует.'}</p>
        <div style="margin-top:3rem;">
          <a href="#/items" class="btn btn-primary">← Назад</a>
          <a href="#/items/${anime.id}/edit" class="btn btn-primary" style="background:#f59e0b;margin-left:1rem;">Редактировать</a>
        </div>
      </article>`;
  } catch (e) {
    app.innerHTML = `<div class="error">Тайтл не найден</div>`;
  }
}

export async function formView({ params } = {}) {
  const isEdit = !!params?.id;
  let anime = { title: '', studio: '', year: '', genres: '', episodes: '', status: 'Идёт', description: '' };
  if (isEdit) {
    app.innerHTML = loading();
    try { anime = await api.getBook(params.id); } catch {}
  }

  app.innerHTML = `
    <div class="form-container">
      <h2>${isEdit ? 'Редактировать' : 'Новый тайтл'}</h2>
      <form id="animeForm">
        <div class="form-group">
          <input type="text" name="title" required value="${anime.title || ''}">
          <label>Название аниме</label>
        </div>
        <div class="form-group">
          <input type="text" name="studio" required value="${anime.studio || ''}">
          <label>Студия</label>
        </div>
        <div class="form-group">
          <input type="text" name="year" value="${anime.year || ''}">
          <label>Год</label>
        </div>
        <div class="form-group">
          <input type="text" name="genres" value="${anime.genres || ''}" placeholder="Фэнтези, Сёнэн">
          <label>Жанры (через запятую)</label>
        </div>
        <div class="form-group">
          <input type="number" name="episodes" value="${anime.episodes || ''}">
          <label>Количество эпизодов</label>
        </div>
        <div class="form-group">
          <select name="status">
            <option value="Идёт" ${anime.status === 'Идёт' ? 'selected' : ''}>Идёт</option>
            <option value="Завершено" ${anime.status === 'Завершено' ? 'selected' : ''}>Завершено</option>
            <option value="Анонс" ${anime.status === 'Анонс' ? 'selected' : ''}>Анонс</option>
          </select>
          <label>Статус</label>
        </div>
        <div class="form-group">
          <textarea name="description" rows="5">${anime.description || ''}</textarea>
          <label>Описание / синопсис</label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            ${isEdit ? 'Сохранить' : 'Добавить тайтл'}
          </button>
          <a href="#/items" class="btn" style="background:#64748b;">Отмена</a>
        </div>
      </form>
    </div>`;

  document.getElementById('animeForm').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Сохранение...';

    const data = {
      title: e.target.title.value.trim(),
      studio: e.target.studio.value.trim(),
      year: e.target.year.value.trim() || null,
      genres: e.target.genres.value.trim() || null,
      episodes: e.target.episodes.value || null,
      status: e.target.status.value,
      description: e.target.description.value.trim() || null
    };

    try {
      if (isEdit) {
        await api.updateBook(params.id, data);
        notify('Тайтл обновлён');
      } else {
        await api.createBook(data);
        notify('Тайтл добавлен');
        e.target.reset();
      }
      location.hash = '/items';
    } catch {
      notify('Ошибка');
      btn.disabled = false;
      btn.textContent = isEdit ? 'Сохранить' : 'Добавить тайтл';
    }
  };
}