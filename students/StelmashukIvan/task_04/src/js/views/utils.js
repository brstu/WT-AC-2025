import { memesAPI } from '../api.js';
import { navigateTo, updateQueryParams } from '../router.js';

const app = document.getElementById('app');
const notification = document.getElementById('notification');

export function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export async function renderItems({ query } = {}) {
    try {
        const search = query?.search || '';
        const page = parseInt(query?.page) || 1;
        const limit = 6;

        const result = await memesAPI.getItems(search, page, limit);

        let html = `
            <header class="page-header">
                <h2>Все мемы</h2>
            </header>
            
            <div class="search-container">
                <input 
                    type="text" 
                    id="searchInput" 
                    class="search-input"
                    placeholder="Поиск мемов..."
                    value="${escapeHtml(search)}"
                    aria-label="Поиск мемов"
                >
            </div>
        `;

        if (result.total === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>Ничего не найдено</h3>
                    <p>${search ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первый мем!'}</p>
                    ${!search ? '<a href="#/new" class="btn btn-primary">Добавить мем</a>' : ''}
                </div>
            `;
            app.innerHTML = html;
            return;
        }

        html += `<div class="items-grid">`;

        result.data.forEach(meme => {
            html += `
                <article class="item-card" onclick="location.hash='#/items/${meme.id}'" role="button" tabindex="0">
                    <img src="${escapeHtml(meme.image)}" alt="${escapeHtml(meme.title)}">
                    <div class="item-card-content">
                        <h3>${escapeHtml(meme.title)}</h3>
                        <p>${escapeHtml(meme.description.slice(0, 80))}...</p>
                    </div>
                </article>
            `;
        });

        html += `</div>`;

        const totalPages = Math.ceil(result.total / limit);
        html += `
            <footer class="pagination-container">
                <div class="pagination-info">
                    Страница ${page} из ${totalPages}
                </div>
                <nav class="pagination-nav" aria-label="Навигация по страницам">
                    <div class="pagination-controls">
                        ${page > 1 ? `
                            <a href="#/items?page=${page - 1}&search=${encodeURIComponent(search)}" 
                               class="btn btn-secondary" aria-label="Предыдущая страница">
                                Назад
                            </a>
                        ` : ''}
                        ${page < totalPages ? `
                            <a href="#/items?page=${page + 1}&search=${encodeURIComponent(search)}" 
                               class="btn btn-primary" aria-label="Следующая страница">
                                Далее
                            </a>
                        ` : ''}
                    </div>
                </nav>
            </footer>
        `;

        app.innerHTML = html;

        const searchInput = document.getElementById('searchInput');
        const debouncedSearch = debounce((value) => {
            updateQueryParams({ search: value, page: 1 });
        }, 500);
        
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateQueryParams({ search: e.target.value, page: 1 });
            }
        });

    } catch (error) {
        app.innerHTML = `
            <div class="error-state">
                <h3>Ошибка загрузки</h3>
                <p>${escapeHtml(error.message)}</p>
                <a href="#/items" class="btn btn-primary">Обновить</a>
            </div>
        `;
    }
}

export async function renderItemDetail({ params }) {
    try {
        const { data } = await memesAPI.getItem(params.id);

        app.innerHTML = `
            <article class="item-detail">
                <div class="item-detail-header">
                    <a href="#/items" class="back-link" aria-label="Вернуться к списку">
                        ← Назад
                    </a>
                    <h2>${escapeHtml(data.title)}</h2>
                </div>
                
                <div class="item-detail-content">
                    <figure class="item-detail-image">
                        <img src="${escapeHtml(data.image)}" alt="${escapeHtml(data.title)}">
                        <figcaption>${escapeHtml(data.title)}</figcaption>
                    </figure>
                    
                    <div class="item-detail-info">
                        <section>
                            <h3>Описание</h3>
                            <p>${escapeHtml(data.description)}</p>
                        </section>
                        
                        <section>
                            <h3>Теги</h3>
                            <div class="tags-container">
                                ${data.tags.map(tag => `
                                    <span class="tag">${escapeHtml(tag)}</span>
                                `).join('') || '<span class="tag">нет тегов</span>'}
                            </div>
                        </section>
                        
                        <section>
                            <h3>Информация</h3>
                            <p><small>Создан: ${data.createdAt}</small></p>
                        </section>

                        <div class="item-detail-actions">
                            <a href="#/items/${data.id}/edit" class="btn btn-primary">
                                Редактировать
                            </a>
                            <button id="deleteBtn" class="btn btn-danger" aria-label="Удалить мем">
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;

        const deleteBtn = document.getElementById('deleteBtn');
        
        deleteBtn.onclick = async () => {
            const confirmed = confirm('Вы уверены, что хотите удалить этот мем?');
            if (confirmed) {
                try {
                    await memesAPI.deleteItem(data.id);
                    showNotification('Мем успешно удалён', 'success');
                    navigateTo('/items');
                } catch (err) {
                    showNotification(err.message, 'error');
                }
            }
        };

    } catch (error) {
        app.innerHTML = `
            <div class="error-state">
                <h3>Ошибка загрузки</h3>
                <p>${escapeHtml(error.message)}</p>
                <a href="#/items" class="btn btn-primary">Вернуться к списку</a>
            </div>
        `;
    }
}

export async function renderItemNew() {
    app.innerHTML = formTemplate('Создать новый мем');
    setupForm('create');
}

export async function renderItemEdit({ params }) {
    try {
        const { data } = await memesAPI.getItem(params.id);
        app.innerHTML = formTemplate('Редактировать мем', data);
        setupForm('edit', data.id);
    } catch (error) {
        app.innerHTML = `
            <div class="error-state">
                <h3>Ошибка загрузки</h3>
                <p>${escapeHtml(error.message)}</p>
                <a href="#/items" class="btn btn-primary">Вернуться к списку</a>
            </div>
        `;
    }
}

function formTemplate(title, data = {}) {
    return `
        <div class="form-container">
            <header class="form-header">
                <a href="${data.id ? `#/items/${data.id}` : '#/items'}" class="back-link">
                    ← Назад
                </a>
                <h2>${title}</h2>
            </header>
            
            <form id="memeForm" class="meme-form">
                <div class="form-group">
                    <label for="titleInput">Название *</label>
                    <input 
                        id="titleInput" 
                        type="text" 
                        required 
                        value="${escapeHtml(data.title || '')}"
                        aria-required="true"
                        placeholder="Введите название мема"
                    >
                    <div class="form-hint">Обязательное поле</div>
                </div>

                <div class="form-group">
                    <label for="descInput">Описание *</label>
                    <textarea 
                        id="descInput" 
                        required 
                        aria-required="true"
                        placeholder="Опишите ваш мем"
                        rows="4"
                    >${escapeHtml(data.description || '')}</textarea>
                    <div class="form-hint">Обязательное поле</div>
                </div>

                <div class="form-group">
                    <label for="imageInput">URL картинки</label>
                    <input 
                        id="imageInput" 
                        type="url" 
                        value="${escapeHtml(data.image || '')}"
                        placeholder="https://example.com/image.jpg"
                        pattern="https?://.+"
                    >
                    <div class="form-hint">Оставьте пустым для изображения по умолчанию</div>
                </div>

                <div class="form-group">
                    <label for="tagsInput">Теги</label>
                    <input 
                        id="tagsInput" 
                        type="text" 
                        value="${data.tags?.map(t => escapeHtml(t)).join(', ') || ''}"
                        placeholder="мем, юмор, интернет"
                    >
                    <div class="form-hint">Введите теги через запятую</div>
                </div>

                <div class="form-actions">
                    <button type="submit" id="saveBtn" class="btn btn-primary">
                        Сохранить
                    </button>
                    <a href="${data.id ? `#/items/${data.id}` : '#/items'}" 
                       class="btn btn-secondary">
                        Отмена
                    </a>
                </div>
            </form>
        </div>
    `;
}

function setupForm(mode, id = null) {
    const form = document.getElementById('memeForm');
    const saveBtn = document.getElementById('saveBtn');
    
    let isSubmitting = false;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        const formData = {
            title: document.getElementById('titleInput').value.trim(),
            description: document.getElementById('descInput').value.trim(),
            image: document.getElementById('imageInput').value.trim(),
            tags: document.getElementById('tagsInput').value
                .split(',')
                .map(t => t.trim())
                .filter(t => t)
        };
        
        if (!formData.title) {
            showNotification('Введите название мема', 'error');
            document.getElementById('titleInput').focus();
            return;
        }
        
        if (!formData.description) {
            showNotification('Введите описание мема', 'error');
            document.getElementById('descInput').focus();
            return;
        }
        
        try {
            isSubmitting = true;
            saveBtn.disabled = true;
            saveBtn.textContent = 'Сохранение...';
            
            if (mode === 'create') {
                await memesAPI.createItem(formData);
                showNotification('Мем успешно создан', 'success');
                navigateTo('/items');
            } else if (mode === 'edit' && id) {
                await memesAPI.updateItem(id, formData);
                showNotification('Изменения сохранены', 'success');
                navigateTo(`/items/${id}`);
            }
        } catch (err) {
            showNotification(err.message, 'error');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Сохранить';
        } finally {
            isSubmitting = false;
        }
    });
}