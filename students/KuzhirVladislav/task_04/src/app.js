const API = 'http://localhost:3000/trainings';
const $ = (s) => document.querySelector(s);

let allTrainings = [];
let currentQuery = '';

const toast = (msg, error = false) => {
  const t = $('#toast');
  t.textContent = msg;
  t.className = error ? 'error' : '';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
};

const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error('Ошибка сервера');
  return res.status !== 204 ? await res.json() : null;
};

const updateHeader = (withSearch = false) => {
  const headerInner = $('.header-inner');
  let searchHTML = '';
  if (withSearch) {
    searchHTML = `
      <div class="search-container">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="м21 21-4.35-4.35"/>
        </svg>
        <input type="text" id="search-input" placeholder="Поиск по названию или выберите тренера..." autocomplete="off" value="${currentQuery}">
        <div class="trainer-suggestions" id="suggestions"></div>
      </div>
    `;
  }
  headerInner.innerHTML = `
    <a href="#" class="logo">Тренинги</a>
    ${searchHTML}
    <a href="#new" class="btn-new">+ Новый</a>
  `;
};

const list = async () => {
  $('#app').innerHTML =
    '<p style="text-align:center;padding:3rem;font-size:1.1rem;color:#64748b">Загрузка...</p>';

  try {
    if (allTrainings.length === 0) {
      allTrainings = await fetchJSON(API);
    }

    const trainers = [...new Set(allTrainings.map((t) => t.trainer).filter(Boolean))].sort();

    updateHeader(true);

    const query = currentQuery.toLowerCase();
    let filtered = allTrainings;
    if (query) {
      filtered = allTrainings.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.trainer && t.trainer.toLowerCase().includes(query))
      );
    }

    let html = '<div class="grid">';
    if (filtered.length === 0) {
      html += `<p style="grid-column:1/-1;text-align:center;padding:3rem;color:#94a3b8;font-size:1.1rem">
        ${query ? 'Ничего не найдено' : 'Пока нет тренингов'}
      </p>`;
    } else {
      filtered.forEach((t) => {
        const img =
          t.image ||
          `https://via.placeholder.com/600x300/6366f1/ffffff?text=${encodeURIComponent(t.title.slice(0, 20))}`;
        html += `
          <div class="card">
            <img src="${img}" alt="${t.title}">
            <div class="card-body">
              <h3><a href="#view/${t.id}">${t.title}</a></h3>
              <p>${t.trainer || 'Тренер не указан'} • ${t.date} • ${t.price} ₽</p>
              <div class="actions">
                <a href="#edit/${t.id}" class="btn-edit">Редактировать</a>
                <button onclick="del(${t.id})" class="btn-delete">Удалить</button>
              </div>
            </div>
          </div>`;
      });
    }
    html += '</div>';
    $('#app').innerHTML = html;

    const input = $('#search-input');
    const suggestions = $('#suggestions');

    const handleClick = (e) => {
      if (!input.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.classList.remove('show');
      }
    };
    document.removeEventListener('click', handleClick);
    document.addEventListener('click', handleClick);

    if (currentQuery) {
      const matches = trainers.filter((tr) =>
        tr.toLowerCase().includes(currentQuery.toLowerCase())
      );
      if (matches.length > 0) {
        matches.forEach((tr) => {
          const div = document.createElement('div');
          div.textContent = tr;
          div.onclick = () => {
            currentQuery = tr;
            suggestions.classList.remove('show');
            list();
          };
          suggestions.appendChild(div);
        });
        suggestions.classList.add('show');
      }
    }

    input.oninput = () => {
      currentQuery = input.value.trim();
      suggestions.innerHTML = '';
      if (!currentQuery) {
        suggestions.classList.remove('show');
        list();
        return;
      }
      const matches = trainers.filter((tr) =>
        tr.toLowerCase().includes(currentQuery.toLowerCase())
      );
      if (matches.length > 0) {
        matches.forEach((tr) => {
          const div = document.createElement('div');
          div.textContent = tr;
          div.onclick = () => {
            currentQuery = tr;
            suggestions.classList.remove('show');
            list();
          };
          suggestions.appendChild(div);
        });
        suggestions.classList.add('show');
      } else {
        suggestions.classList.remove('show');
      }
      list();
    };
  } catch (err) {
    $('#app').innerHTML =
      '<p style="color:#ef4444;text-align:center;padding:3rem">Ошибка загрузки данных</p>';
  }
};

const view = async (id) => {
  updateHeader(false);
  $('#app').innerHTML = '<p style="text-align:center;padding:3rem">Загрузка...</p>';
  try {
    const t = await fetchJSON(`${API}/${id}`);
    const img = t.image || 'https://via.placeholder.com/800x400/6366f1/ffffff?text=Тренинг';
    $('#app').innerHTML = `
      <div class="card" style="max-width:800px;margin:0 auto;overflow:hidden;">
        <img src="${img}" alt="${t.title}" style="height:340px;">
        <div class="card-body">
          <h2 style="font-size:2rem;margin-bottom:1rem">${t.title}</h2>
          <p style="color:var(--muted);font-size:1.1rem;margin:1rem 0">
            <strong>Тренер:</strong> ${t.trainer}<br>
            ${t.date} • ${t.duration} ч • ${t.places} мест • ${t.price} ₽
          </p>
          <p style="margin:1.5rem 0;line-height:1.7;white-space:pre-wrap">${t.description || 'Описание отсутствует'}</p>
          <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap">
            <a href="#edit/${t.id}" class="btn">Редактировать</a>
            <button onclick="del(${t.id})" class="btn danger">Удалить</button>
            <a href="#" style="margin-left:auto;color:var(--muted)">Назад к списку</a>
          </div>
        </div>
      </div>
    `;
  } catch {
    $('#app').innerHTML = '<p style="color:#ef4444;text-align:center">Тренинг не найден</p>';
  }
};

const form = async (id = null) => {
  updateHeader(false);
  let training = {};
  if (id) {
    try {
      training = await fetchJSON(`${API}/${id}`);
    } catch {
      toast('Не удалось загрузить данные', true);
      location.hash = '#';
      return;
    }
  }

  $('#app').innerHTML = `
    <form id="training-form">
      <h2>${id ? 'Редактировать тренинг' : 'Новый тренинг'}</h2>
      <label>Название *</label>
      <input name="title" required value="${training.title || ''}" placeholder="Например: Йога для начинающих">
      <label>Описание *</label>
      <textarea name="description" required rows="5" placeholder="Подробное описание тренинга...">${training.description || ''}</textarea>
      <label>Тренер *</label>
      <input name="trainer" required value="${training.trainer || ''}" placeholder="Имя тренера">
      <label>Дата *</label>
      <input name="date" type="date" required value="${training.date || ''}">
      <label>Продолжительность (часов) *</label>
      <input name="duration" type="number" min="1" required value="${training.duration || ''}">
      <label>Цена (₽) *</label>
      <input name="price" type="number" min="0" required value="${training.price || ''}">
      <label>Количество мест *</label>
      <input name="places" type="number" min="1" required value="${training.places || ''}">
      <label>Изображение (URL)</label>
      <input name="image" value="${training.image || ''}" placeholder="https://...">
      <button type="submit" id="save-btn" class="btn">
        ${id ? 'Сохранить изменения' : 'Создать тренинг'}
      </button>
      <a href="#" style="display:block;text-align:center;margin-top:1rem;color:var(--muted)">Отмена</a>
    </form>
  `;

  $('#training-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = $('#save-btn');
    btn.disabled = true;
    btn.textContent = 'Сохранение...';

    const data = Object.fromEntries(new FormData(e.target));

    try {
      if (id) {
        await fetchJSON(`${API}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        toast('Тренинг обновлён');
      } else {
        await fetchJSON(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        toast('Тренинг создан');
      }
      location.hash = '#';
    } catch (err) {
      toast('Ошибка сохранения', true);
    } finally {
      btn.disabled = false;
      btn.textContent = id ? 'Сохранить изменения' : 'Создать тренинг';
    }
  };
};

window.del = async (id) => {
  if (!confirm('Удалить этот тренинг навсегда?')) return;
  try {
    await fetchJSON(`${API}/${id}`, { method: 'DELETE' });
    toast('Тренинг удалён');
    allTrainings = [];
    location.hash = '#';
  } catch {
    toast('Ошибка удаления', true);
  }
};

const router = () => {
  let hash = location.hash.slice(1) || '';
  hash = hash.replace(/^\/+/, ''); // Remove leading /
  const parts = hash.split('/');
  const page = parts[0];
  const id = parts[1];

  if (page === 'view' && id) view(id);
  else if (page === 'edit' && id) form(id);
  else if (page === 'new') form();
  else list();
};

window.onhashchange = router;
router();
