import { memesAPI } from '../api.js';
import { navigateTo, updateQueryParams } from '../router.js';

const app = document.getElementById('app');
const notification = document.getElementById('notification');

export function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

export async function renderItems({ page = 1 } = {}) {
    try {
        const searchInput = new URLSearchParams(location.hash.split('?')[1] || '').get('search') || '';
        const limit = 6;

        const result = await memesAPI.getItems(searchInput, page, limit);

        let html = `
            <div class="search-container">
                <input 
                    type="text" 
                    id="searchInput" 
                    class="search-input"
                    placeholder="Поиск мемов..."
                    value="${searchInput}"
                >
            </div>
        `;

        if (result.total === 0) {
            app.innerHTML = html + `<div class="empty">Ничего не найдено</div>`;
            return;
        }

        html += `<div class="items-grid">`;

        result.data.forEach(meme => {
            html += `
                <div class="item-card" onclick="location.hash='#/items/${meme.id}'">
                    <img src="${meme.image}" alt="${meme.title}">
                    <div class="item-card-content">
                        <h3>${meme.title}</h3>
                        <p>${meme.description.slice(0, 80)}...</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        // ПАГИНАЦИЯ
        const totalPages = Math.ceil(result.total / limit);
        html += `
            <div style="display:flex;flex-direction:column;align-items:center;margin:2rem 0;gap:1rem;">
                
                <div style="color:#555;font-size:1rem;">
                    Страница ${page} из ${totalPages}
                </div>

                <div style="display:flex;gap:1rem;justify-content:center;">
                    ${page > 1 ? `<a href="#/items?page=${page - 1}" class="btn btn-secondary">Назад</a>` : ''}
                    ${page < totalPages ? `<a href="#/items?page=${page + 1}" class="btn btn-primary">Далее</a>` : ''}
                </div>

            </div>
        `;


        app.innerHTML = html;

        document.getElementById('searchInput').addEventListener('input', (e) => {
            updateQueryParams({ search: e.target.value, page: 1 });
        });

    } catch (error) {
        app.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

/* ============================
    РЕНДЕР ОДНОГО МЕМА
============================ */
export async function renderItemDetail({ params }) {
    try {
        const { data } = await memesAPI.getItem(params.id);

        app.innerHTML = `
            <div class="item-detail">
                <img class="item-detail-image" src="${data.image}">
                <div class="item-detail-content">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                    <p><strong>Теги:</strong> ${data.tags.join(', ') || 'нет'}</p>
                    <p><small>Создан: ${data.createdAt}</small></p>

                    <div class="item-detail-actions">
                        <a href="#/items/${data.id}/edit" class="btn btn-primary">Редактировать</a>
                        <button id="deleteBtn" class="btn btn-danger">Удалить</button>
                        <a href="#/items" class="btn btn-secondary">Назад</a>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('deleteBtn').onclick = async () => {
            try {
                await memesAPI.deleteItem(data.id);
                showNotification('Мем удалён', 'success');
                navigateTo('/items');
            } catch (err) {
                showNotification(err.message, 'error');
            }
        };

    } catch (error) {
        app.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

/* ============================
      СОЗДАНИЕ МЕМА
============================ */
export async function renderItemNew() {
    app.innerHTML = formTemplate('Создать мем');

    setupForm(async (formData) => {
        try {
            await memesAPI.createItem(formData);
            showNotification('Мем создан', 'success');
            navigateTo('/items');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    });
}

/* ============================
      РЕДАКТИРОВАНИЕ МЕМА
============================ */
export async function renderItemEdit({ params }) {
    try {
        const { data } = await memesAPI.getItem(params.id);

        app.innerHTML = formTemplate('Редактировать мем', data);

        setupForm(async (formData) => {
            try {
                await memesAPI.updateItem(data.id, formData);
                showNotification('Изменения сохранены', 'success');
                navigateTo(`/items/${data.id}`);
            } catch (err) {
                showNotification(err.message, 'error');
            }
        });

    } catch (error) {
        app.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

/* ============================
         ОБЩИЕ ФУНКЦИИ
============================ */

function formTemplate(title, data = {}) {
    return `
        <div class="form-container">
            <h2>${title}</h2>
            <div class="form-group">
                <label>Название</label>
                <input id="titleInput" value="${data.title || ''}">
            </div>

            <div class="form-group">
                <label>Описание</label>
                <textarea id="descInput">${data.description || ''}</textarea>
            </div>

            <div class="form-group">
                <label>URL картинки</label>
                <input id="imageInput" value="${data.image || ''}">
            </div>

            <div class="form-group">
                <label>Теги (через запятую)</label>
                <input id="tagsInput" value="${data.tags?.join(', ') || ''}">
            </div>

            <div class="form-actions">
                <button id="saveBtn" class="btn btn-primary">Сохранить</button>
                <a href="#/items" class="btn btn-secondary">Отмена</a>
            </div>
        </div>
    `;
}

function setupForm(onSubmit) {
    document.getElementById('saveBtn').onclick = () => {
        const formData = {
            title: document.getElementById('titleInput').value,
            description: document.getElementById('descInput').value,
            image: document.getElementById('imageInput').value,
            tags: document.getElementById('tagsInput').value
                .split(',')
                .map(t => t.trim())
                .filter(t => t)
        };

        onSubmit(formData);
    };
}
