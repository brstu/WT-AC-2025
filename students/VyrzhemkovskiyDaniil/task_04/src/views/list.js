import { api } from '../api.js';

const app = document.getElementById('app');

export async function renderList() {
  app.innerHTML = '<p class="loading">Загрузка...</p>';

  try {
    const items = await api.getAll();

    // Получаем текущий query из hash
    const hash = location.hash;
    const query = new URLSearchParams(hash.split('?')[1] || '').get('q') || '';
    let q = query.toLowerCase();

    const filtered = items.filter(item => item.title && item.title.toLowerCase().includes(q));

    app.innerHTML = `
      <input
        id="search"
        placeholder="Поиск по названию..."
        value="${query}"
      />
      ${
        filtered.length
          ? `<ul class="list">
              ${filtered.map(item => `
                <li>
                  <h3>${item.title}</h3>
                  <p>${item.genre}</p>
                  <a href="#/items/${item.id}">Подробнее</a>
                </li>
              `).join('')}
            </ul>`
          : '<p class="empty">Ничего не найдено</p>'
      }
    `;

    const input = document.getElementById('search');
    
    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const value = input.value.trim();
        location.hash = value
          ? `#/items?q=${encodeURIComponent(value)}`
          : '#/items';
      }, 300);
    });

  } catch (e) {
    console.error(e);
    app.innerHTML = '<p class="error">Ошибка загрузки списка</p>';
  }
}
