import { api } from '../api.js';
import { showNotification } from '../utils.js';

export async function detailView({ params }) {
  const app = document.getElementById('app');
  const [id] = params;

  try {
    const note = await api.getById(id);
    app.innerHTML = `
      <a href="#/items">← Назад</a>
      <h2>${note.title || 'Без заголовка'}</h2>
      <p style="white-space: pre-wrap;">${note.body || ''}</p>
      <div class="actions">
        <a href="#/items/${id}/edit"><button>Редактировать</button></a>
        <button class="danger" data-id="${id}">Удалить</button>
      </div>
    `;

    document.querySelector('.danger').addEventListener('click', async () => {
      if (!confirm('Удалить навсегда?')) return;
      await api.delete(id);
      showNotification('Удалено');
      location.hash = '#/items';
    });

  } catch (err) {
    app.innerHTML = `<div class="error">Заметка не найдена</div>`;
  }
}