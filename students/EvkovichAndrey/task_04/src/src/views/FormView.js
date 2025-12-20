import { api } from '../api.js';
import { showNotification } from './components/Notification.js';

export class FormView {
    mode = 'create'; // create или edit
    id = null;

    async render() {
        const title = this.mode === 'create' ? 'Новая серия' : 'Редактировать серию';
        const content = document.getElementById('content');

        let initialData = { title: '', body: '' };
        if (this.mode === 'edit') {
            content.innerHTML = '<div class="loading">Загрузка...</div>';
            try {
                initialData = await api.getOne(this.id);
            } catch (e) {
                content.innerHTML = `<div class="error">${e.message}</div>`;
                return;
            }
        }

        content.innerHTML = `
      <h2>${title}</h2>
      <form id="item-form">
        <label>Название серии:<br>
          <input type="text" name="title" value="${initialData.title || ''}" required>
        </label><br><br>
        <label>Автор и описание:<br>
          <textarea name="body" required>${initialData.body || ''}</textarea>
        </label><br><br>
        <button type="submit" id="submit-btn">${this.mode === 'create' ? 'Создать' : 'Сохранить'}</button>
        <a href="#/items">← Назад</a>
      </form>
    `;

        document.getElementById('item-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-btn');
            btn.disabled = true;
            btn.textContent = 'Сохранение...';

            const formData = Object.fromEntries(new FormData(e.target));

            try {
                if (this.mode === 'create') {
                    await api.create(formData);
                    showNotification('Серия создана!');
                    location.hash = '#/items';
                } else {
                    await api.update(this.id, formData);
                    showNotification('Серия обновлена!');
                    location.hash = `#/items/${this.id}`;
                }
            } catch (err) {
                showNotification(err.message, 'error');
                btn.disabled = false;
                btn.textContent = this.mode === 'create' ? 'Создать' : 'Сохранить';
            }
        });
    }
}