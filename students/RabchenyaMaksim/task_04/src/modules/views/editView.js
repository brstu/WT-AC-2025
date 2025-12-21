import { api } from '../api.js';
import { showNotification } from '../utils.js';

export async function editView({ params }) {
  const app = document.getElementById('app');
  const [id] = params || [];
  const isEdit = !!id;

  let note = { title: '', body: '' };
  if (isEdit) {
    try {
      note = await api.getById(id);
    } catch {
      app.innerHTML = '<div class="error">Не удалось загрузить</div>';
      return;
    }
  }

  app.innerHTML = `
    <a href="${isEdit ? '#/items/' + id : '#/items'}">← Отмена</a>
    <h2>${isEdit ? 'Редактировать' : 'Новая заметка'}</h2>
    <form id="noteForm">
      <input type="text" name="title" placeholder="Заголовок" value="${note.title || ''}" required>
      <textarea name="body" rows="10" placeholder="Текст заметки..." required>${note.body || ''}</textarea>
      <button type="submit" id="submitBtn">${isEdit ? 'Сохранить' : 'Создать'}</button>
    </form>
  `;

  const form = document.getElementById('noteForm');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Сохранение...';

    const data = {
      title: form.title.value.trim(),
      body: form.body.value.trim()
    };

    try {
      if (isEdit) {
        await api.update(id, data);
        showNotification('Сохранено');
        location.hash = `#/items/${id}`;
      } else {
        const created = await api.create(data);
        showNotification('Создана новая заметка');
        location.hash = `#/items/${created.id}`;
      }
    } catch (err) {
      showNotification(err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? 'Сохранить' : 'Создать';
    }
  });
}