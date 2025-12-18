import api from '../api.js';
import { renderLoader, renderError, showNotification } from '../utils.js';

export async function formPage({ params }) {
    const app = document.getElementById('app');
    const isEdit = !!params.id; // Если есть ID, значит редактируем
    
    let initialData = { name: '', brand: '', price: '', desc: '' };

    if (isEdit) {
        app.innerHTML = renderLoader();
        try {
            initialData = await api.getById(params.id);
        } catch (e) {
            app.innerHTML = renderError('Не удалось загрузить данные для редактирования');
            return;
        }
    }

    app.innerHTML = `
        <h1>${isEdit ? 'Редактирование' : 'Новый гаджет'}</h1>
        <form id="gadget-form" class="card">
            <div class="form-group">
                <label>Название</label>
                <input type="text" name="name" value="${initialData.name}" required>
            </div>
            <div class="form-group">
                <label>Бренд</label>
                <input type="text" name="brand" value="${initialData.brand}" required>
            </div>
            <div class="form-group">
                <label>Цена ($)</label>
                <input type="number" name="price" value="${initialData.price}" required>
            </div>
            <div class="form-group">
                <label>Описание</label>
                <textarea name="desc" rows="3">${initialData.desc}</textarea>
            </div>
            <button type="submit" class="btn btn-primary" id="submit-btn">
                ${isEdit ? 'Сохранить' : 'Создать'}
            </button>
            <a href="${isEdit ? `#/items/${params.id}` : '#/items'}" class="btn">Отмена</a>
        </form>
    `;

    document.getElementById('gadget-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Блокировка кнопки
        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.textContent = 'Сохранение...';

        try {
            if (isEdit) {
                await api.update(params.id, data);
                showNotification('Гаджет обновлен!');
                location.hash = `#/items/${params.id}`;
            } else {
                await api.create(data);
                showNotification('Гаджет создан!');
                location.hash = `#/items`;
            }
        } catch (err) {
            showNotification(err.message, 'error');
            btn.disabled = false;
            btn.textContent = isEdit ? 'Сохранить' : 'Создать';
        }
    });
}