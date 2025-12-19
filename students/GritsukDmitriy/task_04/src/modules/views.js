import { fetchCharacters, fetchCharacter, createCharacter, updateCharacter, deleteCharacter, searchCharacters } from './api.js';
import { formatDate, showError, showEmptyState, createElement, validateForm, debounce } from './utils.js';

// Текущие параметры списка
let currentParams = {
    page: 1,
    limit: 12,
    search: ''
};

/**
 * Отображает список персонажей
 */
export async function renderCharactersList(params = {}) {
    const appContent = document.getElementById('app-content');
    
    try {
        // Обновляем текущие параметры
        currentParams = { ...currentParams, ...params };
        
        // Отображаем загрузку
        appContent.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p>Загрузка персонажей...</p>
            </div>
        `;
        
        // Получаем данные
        const data = await fetchCharacters(currentParams);
        
        // Если нет персонажей
        if (!data.characters || data.characters.length === 0) {
            showEmptyState('Персонажи не найдены');
            return;
        }
        
        // Рендерим список
        const charactersGrid = createElement('div', { className: 'characters-grid' });
        
        data.characters.forEach(character => {
            const characterCard = createCharacterCard(character);
            charactersGrid.appendChild(characterCard);
        });
        
        // Создаем контейнер
        const container = createElement('div', { className: 'characters-container' }, [
            createCharactersHeader(data.totalCount),
            charactersGrid,
            createPagination(data.totalCount, data.page, data.limit)
        ]);
        
        appContent.innerHTML = '';
        appContent.appendChild(container);
        
        // Навешиваем обработчики поиска
        setupSearch();
        
    } catch (error) {
        showError('Не удалось загрузить список персонажей', () => renderCharactersList());
    }
}

/**
 * Создает карточку персонажа
 */
function createCharacterCard(character) {
    const card = createElement('div', { className: 'character-card' });
    
    card.innerHTML = `
        <div class="character-image">
            ${character.imageUrl ? 
                `<img src="${character.imageUrl}" alt="${character.name}">` : 
                `<i class="fas fa-user-circle"></i>`}
        </div>
        <div class="character-info">
            <h3>${character.name}</h3>
            <div class="character-meta">
                <span class="character-tag">${character.universe || 'Не указано'}</span>
                <span class="character-tag">${character.category || 'Не указано'}</span>
            </div>
            <p class="character-description">
                ${character.description || 'Описание отсутствует'}
            </p>
            <div class="character-actions">
                <button class="btn btn-primary" onclick="window.location.hash='#/characters/${character.id}'">
                    <i class="fas fa-eye"></i> Подробнее
                </button>
                <button class="btn btn-edit" onclick="window.location.hash='#/characters/${character.id}/edit'">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Создает заголовок списка
 */
function createCharactersHeader(totalCount) {
    const header = createElement('div', { className: 'characters-header' });
    
    header.innerHTML = `
        <h1>Персонажи <span style="color: var(--gray-color); font-size: 1rem;">(${totalCount})</span></h1>
        <div class="search-container">
            <input type="text" class="search-input" placeholder="Поиск по имени..." value="${currentParams.search || ''}">
            <button class="btn btn-secondary" id="clear-search" style="${currentParams.search ? '' : 'display: none;'}">
                <i class="fas fa-times"></i> Очистить
            </button>
        </div>
    `;
    
    return header;
}

/**
 * Настраивает поиск
 */
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const clearButton = document.getElementById('clear-search');
    
    if (!searchInput) return;
    
    // Дебаунс поиска
    const debouncedSearch = debounce((query) => {
        if (query.trim()) {
            currentParams.search = query;
            currentParams.page = 1;
            renderCharactersList({ search: query, page: 1 });
        } else {
            currentParams.search = '';
            currentParams.page = 1;
            renderCharactersList({ search: '', page: 1 });
        }
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (clearButton) {
            clearButton.style.display = query ? '' : 'none';
        }
        debouncedSearch(query);
    });
    
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            clearButton.style.display = 'none';
            currentParams.search = '';
            currentParams.page = 1;
            renderCharactersList();
        });
    }
}

/**
 * Создает пагинацию
 */
function createPagination(totalCount, currentPage, limit) {
    const totalPages = Math.ceil(totalCount / limit);
    
    if (totalPages <= 1) return createElement('div');
    
    const pagination = createElement('div', { className: 'pagination' });
    
    pagination.innerHTML = `
        <button ${currentPage <= 1 ? 'disabled' : ''} id="prev-page">
            <i class="fas fa-chevron-left"></i> Назад
        </button>
        <span class="pagination-info">
            Страница ${currentPage} из ${totalPages}
        </span>
        <button ${currentPage >= totalPages ? 'disabled' : ''} id="next-page">
            Вперед <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    // Обработчики пагинации
    const prevButton = pagination.querySelector('#prev-page');
    const nextButton = pagination.querySelector('#next-page');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                renderCharactersList({ page: currentPage - 1 });
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                renderCharactersList({ page: currentPage + 1 });
            }
        });
    }
    
    return pagination;
}

/**
 * Отображает детальную информацию о персонаже
 */
export async function renderCharacterDetail(id) {
    const appContent = document.getElementById('app-content');
    
    try {
        appContent.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p>Загрузка персонажа...</p>
            </div>
        `;
        
        const character = await fetchCharacter(id);
        
        const container = createElement('div', { className: 'character-detail-container' }, [
            createCharacterDetailHeader(character),
            createCharacterDetailContent(character),
            createCharacterDetailActions(character)
        ]);
        
        appContent.innerHTML = '';
        appContent.appendChild(container);
        
    } catch (error) {
        showError(error.message, () => window.location.hash = '#/characters');
    }
}

/**
 * Создает заголовок детальной страницы
 */
function createCharacterDetailHeader(character) {
    const header = createElement('div', { className: 'character-detail-header' });
    
    header.innerHTML = `
        <div class="character-detail-image">
            ${character.imageUrl ? 
                `<img src="${character.imageUrl}" alt="${character.name}">` : 
                `<div style="width: 300px; height: 300px; background: var(--border-color); display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg);">
                    <i class="fas fa-user-circle" style="font-size: 5rem; color: var(--gray-color);"></i>
                </div>`}
        </div>
        <div class="character-detail-info">
            <h1>${character.name}</h1>
            <div class="character-detail-meta">
                <span class="character-tag">${character.universe || 'Не указано'}</span>
                <span class="character-tag">${character.category || 'Не указано'}</span>
                <span class="character-tag">${character.status || 'Не указано'}</span>
                <span class="character-tag">${character.gender || 'Не указано'}</span>
            </div>
            <p style="margin-top: 1rem; color: var(--gray-color);">
                <strong>Создан:</strong> ${formatDate(character.createdAt)}
                <br>
                <strong>Обновлен:</strong> ${formatDate(character.updatedAt)}
            </p>
        </div>
    `;
    
    return header;
}

/**
 * Создает контент детальной страницы
 */
function createCharacterDetailContent(character) {
    const content = createElement('div', { className: 'character-detail-content' });
    
    content.innerHTML = `
        <h2>Описание</h2>
        <p>${character.description || 'Описание отсутствует'}</p>
        
        ${character.biography ? `
            <h2>Биография</h2>
            <p>${character.biography}</p>
        ` : ''}
        
        ${character.abilities ? `
            <h2>Способности</h2>
            <p>${character.abilities}</p>
        ` : ''}
        
        ${character.weaknesses ? `
            <h2>Слабости</h2>
            <p>${character.weaknesses}</p>
        ` : ''}
        
        ${character.relationships ? `
            <h2>Отношения</h2>
            <p>${character.relationships}</p>
        ` : ''}
    `;
    
    return content;
}

/**
 * Создает кнопки действий для детальной страницы
 */
function createCharacterDetailActions(character) {
    const actions = createElement('div', { className: 'character-detail-actions' });
    
    actions.innerHTML = `
        <button class="btn btn-secondary" onclick="window.location.hash='#/characters'">
            <i class="fas fa-arrow-left"></i> Назад к списку
        </button>
        <button class="btn btn-edit" onclick="window.location.hash='#/characters/${character.id}/edit'">
            <i class="fas fa-edit"></i> Редактировать
        </button>
        <button class="btn btn-danger" id="delete-character" data-id="${character.id}">
            <i class="fas fa-trash"></i> Удалить
        </button>
    `;
    
    // Обработчик удаления
    const deleteButton = actions.querySelector('#delete-character');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            showDeleteConfirmation(character.id, character.name);
        });
    }
    
    return actions;
}

/**
 * Показывает подтверждение удаления
 */
function showDeleteConfirmation(id, name) {
    const modal = createElement('div', { className: 'modal-overlay' });
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">Подтверждение удаления</div>
            <div class="modal-body">
                Вы уверены, что хотите удалить персонажа "<strong>${name}</strong>"?
                Это действие нельзя отменить.
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-delete">Отмена</button>
                <button class="btn btn-danger" id="confirm-delete">Удалить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики модального окна
    modal.querySelector('#cancel-delete').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#confirm-delete').addEventListener('click', async () => {
        try {
            await deleteCharacter(id);
            document.body.removeChild(modal);
            window.location.hash = '#/characters';
        } catch (error) {
            document.body.removeChild(modal);
        }
    });
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Отображает форму создания/редактирования персонажа
 */
export async function renderCharacterForm(id = null) {
    const appContent = document.getElementById('app-content');
    
    let character = null;
    if (id) {
        try {
            character = await fetchCharacter(id);
        } catch (error) {
            showError('Не удалось загрузить данные персонажа');
            return;
        }
    }
    
    const isEdit = !!id;
    
    const container = createElement('div', { className: 'form-container' }, [
        createFormHeader(isEdit ? 'Редактирование персонажа' : 'Создание нового персонажа'),
        createFormContent(character),
        createFormActions(isEdit, id)
    ]);
    
    appContent.innerHTML = '';
    appContent.appendChild(container);
    
    // Навешиваем обработчики формы
    setupForm(isEdit, id);
}

/**
 * Создает заголовок формы
 */
function createFormHeader(title) {
    const header = createElement('div', { className: 'form-header' });
    header.innerHTML = `<h1>${title}</h1>`;
    return header;
}

/**
 * Создает содержимое формы
 */
function createFormContent(character = null) {
    const content = createElement('div', { className: 'form-content' });
    
    content.innerHTML = `
        <form id="character-form">
            <div class="form-group">
                <label for="name">Имя персонажа *</label>
                <input type="text" id="name" name="name" value="${character?.name || ''}" required>
                <div class="error-message" id="name-error"></div>
            </div>
            
            <div class="form-group">
                <label for="universe">Вселенная *</label>
                <input type="text" id="universe" name="universe" value="${character?.universe || ''}" required>
                <div class="error-message" id="universe-error"></div>
            </div>
            
            <div class="form-group">
                <label for="category">Категория *</label>
                <select id="category" name="category" required>
                    <option value="">Выберите категорию</option>
                    <option value="Герой" ${character?.category === 'Герой' ? 'selected' : ''}>Герой</option>
                    <option value="Злодей" ${character?.category === 'Злодей' ? 'selected' : ''}>Злодей</option>
                    <option value="Антигерой" ${character?.category === 'Антигерой' ? 'selected' : ''}>Антигерой</option>
                    <option value="Нейтральный" ${character?.category === 'Нейтральный' ? 'selected' : ''}>Нейтральный</option>
                    <option value="Другой" ${character?.category === 'Другой' ? 'selected' : ''}>Другой</option>
                </select>
                <div class="error-message" id="category-error"></div>
            </div>
            
            <div class="form-group">
                <label for="status">Статус</label>
                <select id="status" name="status">
                    <option value="">Выберите статус</option>
                    <option value="Жив" ${character?.status === 'Жив' ? 'selected' : ''}>Жив</option>
                    <option value="Мертв" ${character?.status === 'Мертв' ? 'selected' : ''}>Мертв</option>
                    <option value="Неизвестно" ${character?.status === 'Неизвестно' ? 'selected' : ''}>Неизвестно</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="gender">Пол</label>
                <select id="gender" name="gender">
                    <option value="">Выберите пол</option>
                    <option value="Мужской" ${character?.gender === 'Мужской' ? 'selected' : ''}>Мужской</option>
                    <option value="Женский" ${character?.gender === 'Женский' ? 'selected' : ''}>Женский</option>
                    <option value="Другой" ${character?.gender === 'Другой' ? 'selected' : ''}>Другой</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="imageUrl">URL изображения</label>
                <input type="url" id="imageUrl" name="imageUrl" value="${character?.imageUrl || ''}" placeholder="https://example.com/image.jpg">
            </div>
            
            <div class="form-group">
                <label for="description">Краткое описание *</label>
                <textarea id="description" name="description" required>${character?.description || ''}</textarea>
                <div class="error-message" id="description-error"></div>
            </div>
            
            <div class="form-group">
                <label for="biography">Полная биография</label>
                <textarea id="biography" name="biography">${character?.biography || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="abilities">Способности</label>
                <textarea id="abilities" name="abilities">${character?.abilities || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="weaknesses">Слабости</label>
                <textarea id="weaknesses" name="weaknesses">${character?.weaknesses || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="relationships">Отношения с другими персонажами</label>
                <textarea id="relationships" name="relationships">${character?.relationships || ''}</textarea>
            </div>
        </form>
    `;
    
    return content;
}

/**
 * Создает кнопки действий формы
 */
function createFormActions(isEdit, id) {
    const actions = createElement('div', { className: 'form-actions' });
    
    actions.innerHTML = `
        <button class="btn btn-secondary" onclick="window.location.hash='#/characters'">
            Отмена
        </button>
        <button class="btn btn-primary" id="submit-form" ${isEdit ? `data-id="${id}"` : ''}>
            ${isEdit ? 'Обновить' : 'Создать'}
        </button>
    `;
    
    return actions;
}

/**
 * Настраивает обработчики формы
 */
function setupForm(isEdit, id) {
    const form = document.getElementById('character-form');
    const submitButton = document.getElementById('submit-form');
    
    if (!form || !submitButton) return;
    
    // Обработчик отправки формы
    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Собираем данные формы
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Валидация
        const errors = validateForm(data);
        
        // Показываем ошибки
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.style.color = 'var(--danger-color)';
                errorElement.style.fontSize = '0.875rem';
                errorElement.style.marginTop = '0.25rem';
            }
        });
        
        // Если есть ошибки, останавливаем отправку
        if (Object.keys(errors).length > 0) {
            return;
        }
        
        // Очищаем ошибки
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Блокируем кнопку
        submitButton.disabled = true;
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${isEdit ? 'Обновление...' : 'Создание...'}`;
        
        try {
            if (isEdit) {
                await updateCharacter(id, data);
                window.location.hash = `#/characters/${id}`;
            } else {
                const newCharacter = await createCharacter(data);
                window.location.hash = `#/characters/${newCharacter.id}`;
            }
        } catch (error) {
            // В случае ошибки разблокируем кнопку
            submitButton.disabled = false;
            submitButton.innerHTML = isEdit ? 'Обновить' : 'Создать';
        }
    });
    
    // Очистка ошибок при вводе
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', () => {
            const errorElement = document.getElementById(`${input.name}-error`);
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    });
}