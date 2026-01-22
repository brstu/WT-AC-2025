import { api } from '../api.js';

const app = document.getElementById('app');

export async function renderDetail(id) {
  app.innerHTML = '<p class="loading">Загрузка...</p>';

  try {
    const item = await api.getOne(id);

    if (!item) throw new Error('not found');

    app.innerHTML = `
      <div class="card">
        <h2>${item.title}</h2>
        <p><b>Жанр:</b> ${item.genre}</p>
        <p><b>Игроки:</b> ${item.players}</p>
        <p><b>Время:</b> ${item.time} мин</p>
        <p>${item.description}</p>

        <button id="delete">Удалить</button>
        <a href="#/items/${item.id}/edit">Редактировать</a>
      </div>
    `;

    document.getElementById('delete').onclick = async () => {
      if (!confirm('Удалить игру?')) return;
      await api.remove(item.id);
      location.hash = '#/items';
    };

  } catch (e) {
    app.innerHTML = '<p class="error">Игра не найдена</p>';
  }
}
