import { api } from '../api.js';
import { showNotification, setLoading } from '../utils.js';

export async function listView({ query = {} }) {
  const app = document.getElementById('app');
  const search = query.search || '';

  // Сохраняем поиск в hash
  const updateSearch = (value) => {
    const newHash = value ? `#items?search=${encodeURIComponent(value)}` : '#/items';
    if (location.hash !== newHash) history.pushState(null, '', newHash);
  };

  try {
    const notes = await api.getAll(search);
    
    app.innerHTML = `
      <div class="search">
        <input type="text" placeholder="Поиск..." value="${search}" id="searchInput">
      </div>
      <div id="notesList"></div>
    `;

    const searchInput = document.getElementById('searchInput');
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => updateSearch(e.target.value), 400);
    });

    const notesList = document.getElementById('notesList');
    if (notes.length === 0) {
      notesList.innerHTML = '<div class="empty">Нет заметок. <a href="#/new">Создать первую?</a></div>';
      return;
    }

    notesList.innerHTML = notes.map(note => `
      <div class="note-card">
        <h3><a href="#/items/${note.id}">${note.title || 'Без заголовка'}</a></h3>
        <p>${(note.body || '').substring(0, 150)}${(note.body || '').length > 150 ? '...' : ''}</p>
        <div class="actions">
          <a href="#/items/${note.id}/edit"><button>Редактировать</button></a>
          <button class="danger" data-id="${note.id}">Удалить</button>
        </div>
      </div>
    `).join('');

    notesList.querySelectorAll('.danger').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (!confirm('Удалить заметку?')) return;
        btn.disabled = true;
        try {
          await api.delete(id);
          showNotification('Заметка удалена');
          router.navigate(); // перезагрузим список
        } catch (err) {
          showNotification(err.message, 'error');
          btn.disabled = false;
        }
      });
    });

  } catch (err) {
    app.innerHTML = `<div class="error">${err.message}</div>`;
  }
}