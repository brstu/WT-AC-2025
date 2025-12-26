// Главный модуль приложения
const App = (function() {
    let currentSearchQuery = '';
    
    // Инициализация приложения
    const init = () => {
        Router.init();
        
        // Регистрация маршрутов
        Router.addRoute('/', showMuseumsList);
        Router.addRoute('/items', showMuseumsList);
        Router.addRoute('/items/:id', showMuseumDetail);
        Router.addRoute('/new', showCreateForm);
        Router.addRoute('/items/:id/edit', showEditForm);
        
        // Инициализация обработчиков событий
        initEventHandlers();
    };
    
    // Инициализация глобальных обработчиков событий
    const initEventHandlers = () => {
        // Делегирование событий для кнопок "Повторить" при ошибках
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('retry-btn')) {
                const currentPath = window.location.hash.substring(1);
                Router.navigate('#' + currentPath);
            }
        });
    };
    
    // Показ состояния загрузки
    const showLoading = () => {
        const template = document.getElementById('loading-template');
        const content = document.getElementById('content');
        content.innerHTML = '';
        content.appendChild(template.content.cloneNode(true));
    };
    
    // Показ состояния ошибки
    const showError = (message) => {
        const template = document.getElementById('error-template');
        const content = document.getElementById('content');
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.error-message').textContent = message;
        content.innerHTML = '';
        content.appendChild(clone);
    };
    
    // Показ пустого состояния
    const showEmptyState = (message = 'Нет данных для отображения') => {
        const template = document.getElementById('empty-template');
        const content = document.getElementById('content');
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('p').textContent = message;
        content.innerHTML = '';
        content.appendChild(clone);
    };
    
    // Показать уведомление
    const showNotification = (type, title, message) => {
        const container = document.getElementById('notification-container');
        const template = document.getElementById('notification-template');
        const notification = template.content.cloneNode(true).querySelector('.notification');
        
        notification.classList.add(type);
        notification.querySelector('.notification-icon').className = `notification-icon fas ${
            type === 'success' ? 'fa-check-circle' :
            type === 'error' ? 'fa-exclamation-circle' :
            type === 'warning' ? 'fa-exclamation-triangle' :
            'fa-info-circle'
        }`;
        
        notification.querySelector('.notification-title').textContent = title;
        notification.querySelector('.notification-message').textContent = message;
        
        // Кнопка закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        container.appendChild(notification);
    };
    
    // Показать модальное окно подтверждения
    const showConfirmModal = (message, onConfirm) => {
        const template = document.getElementById('confirm-modal-template');
        const modal = template.content.cloneNode(true).querySelector('.modal-overlay');
        
        if (message) {
            modal.querySelector('.modal-body p').textContent = message;
        }
        
        // Обработчики событий для модального окна
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            onConfirm();
            modal.remove();
        });
        
        // Закрытие при клике вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    };
    
    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return 'Не указано';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    
    // Показать список музеев
    const showMuseumsList = async (params) => {
        showLoading();
        
        try {
            // Сохранение параметров поиска в hash
            const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            currentSearchQuery = hashParams.get('search') || '';
            
            let museums;
            if (currentSearchQuery) {
                museums = await MuseumAPI.searchMuseums(currentSearchQuery);
            } else {
                museums = await MuseumAPI.getAllMuseums();
            }
            
            if (museums.length === 0) {
                showEmptyState(currentSearchQuery ? 
                    `По запросу "${currentSearchQuery}" ничего не найдено` : 
                    'Список музеев пуст. Добавьте первый музей!');
                return;
            }
            
            renderMuseumsList(museums);
        } catch (error) {
            showError(error.message);
        }
    };
    
    // Рендер списка музеев
    const renderMuseumsList = (museums) => {
        const content = document.getElementById('content');
        
        const html = `
            <div class="museums-container">
                <div class="search-bar">
                    <input 
                        type="text" 
                        class="search-input" 
                        id="search-input" 
                        placeholder="Поиск музеев по названию, городу, описанию..." 
                        value="${currentSearchQuery}"
                    >
                    <button class="btn btn-primary" id="search-btn">
                        <i class="fas fa-search"></i> Поиск
                    </button>
                    <button class="btn btn-secondary" id="clear-search-btn">
                        <i class="fas fa-times"></i> Очистить
                    </button>
                </div>
                
                <div class="museums-list">
                    ${museums.map(museum => `
                        <div class="museum-card">
                            <div class="museum-image">
                                <i class="fas fa-landmark"></i>
                            </div>
                            <div class="museum-content">
                                <h3 class="museum-title">${museum.name}</h3>
                                <div class="museum-location">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${museum.city}, ${museum.address}</span>
                                </div>
                                <p class="museum-description">${museum.description.substring(0, 150)}${museum.description.length > 150 ? '...' : ''}</p>
                                <div class="museum-actions">
                                    <span class="visited-badge ${museum.visited ? 'visited' : 'not-visited'}">
                                        <i class="fas ${museum.visited ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                        ${museum.visited ? 'Был' : 'Не был'}
                                    </span>
                                    <a href="#/items/${museum.id}" class="btn btn-primary">
                                        <i class="fas fa-eye"></i> Подробнее
                                    </a>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        
        // Обработчики событий для поиска
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const clearSearchBtn = document.getElementById('clear-search-btn');
        
        const performSearch = () => {
            const query = searchInput.value.trim();
            const currentHash = window.location.hash.split('?')[0];
            
            if (query) {
                Router.navigate(`${currentHash}?search=${encodeURIComponent(query)}`);
            } else {
                Router.navigate(currentHash);
            }
        };
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        searchBtn.addEventListener('click', performSearch);
        
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            const currentHash = window.location.hash.split('?')[0];
            Router.navigate(currentHash);
        });
    };
    
    // Показать детальную информацию о музее
    const showMuseumDetail = async (params) => {
        showLoading();
        
        try {
            const museum = await MuseumAPI.getMuseumById(params.id);
            renderMuseumDetail(museum);
        } catch (error) {
            showError(error.message);
        }
    };
    
    // Рендер детальной информации о музее
    const renderMuseumDetail = (museum) => {
        const content = document.getElementById('content');
        
        const html = `
            <div class="museum-detail">
                <div class="detail-header">
                    <div class="detail-header-content">
                        <h2 class="detail-title">${museum.name}</h2>
                        <div class="detail-subtitle">
                            <span>
                                <i class="fas fa-map-marker-alt"></i>
                                ${museum.city}, ${museum.address}
                            </span>
                            <span>
                                <i class="fas fa-tag"></i>
                                ${museum.category}
                            </span>
                            <span class="visited-badge ${museum.visited ? 'visited' : 'not-visited'}">
                                <i class="fas ${museum.visited ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                ${museum.visited ? 'Был' : 'Не был'}
                            </span>
                        </div>
                    </div>
                    <div class="detail-actions">
                        <a href="#/items/${museum.id}/edit" class="btn btn-primary">
                            <i class="fas fa-edit"></i> Редактировать
                        </a>
                        <button class="btn btn-danger" id="delete-btn">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                        <a href="#/items" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Назад
                        </a>
                    </div>
                </div>
                
                <div class="detail-body">
                    <div class="detail-info">
                        <div class="info-section">
                            <h3>Описание</h3>
                            <p>${museum.description}</p>
                        </div>
                        
                        <div class="info-section">
                            <h3>Информация</h3>
                            <div class="info-item">
                                <span class="info-label">Город:</span>
                                <span>${museum.city}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Адрес:</span>
                                <span>${museum.address}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Категория:</span>
                                <span>${museum.category}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Основан:</span>
                                <span>${museum.founded} год</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Сайт:</span>
                                <a href="${museum.website}" target="_blank">${museum.website}</a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="visit-form">
                        <h3>Статус посещения</h3>
                        <form id="visit-form">
                            <div class="form-group">
                                <div class="form-label">Вы посетили этот музей?</div>
                                <div>
                                    <label>
                                        <input type="radio" name="visited" value="true" ${museum.visited ? 'checked' : ''}>
                                        Да, был
                                    </label>
                                    <label style="margin-left: 1rem;">
                                        <input type="radio" name="visited" value="false" ${!museum.visited ? 'checked' : ''}>
                                        Нет, не был
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group" id="visit-date-group" ${!museum.visited ? 'style="display: none;"' : ''}>
                                <label for="visit-date" class="form-label">Дата посещения</label>
                                <input 
                                    type="date" 
                                    id="visit-date" 
                                    name="visitDate" 
                                    class="form-control"
                                    value="${museum.visitDate || ''}"
                                >
                            </div>
                            
                            <div class="form-group" id="rating-group" ${!museum.visited ? 'style="display: none;"' : ''}>
                                <label for="rating" class="form-label">Оценка (1-5)</label>
                                <select id="rating" name="rating" class="form-control">
                                    <option value="">Не оценивал</option>
                                    ${[1, 2, 3, 4, 5].map(num => `
                                        <option value="${num}" ${museum.rating === num ? 'selected' : ''}>${num}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-success">
                                    <i class="fas fa-save"></i> Сохранить статус
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        
        // Обработчики событий
        const deleteBtn = document.getElementById('delete-btn');
        const visitForm = document.getElementById('visit-form');
        const visitedRadios = visitForm.querySelectorAll('input[name="visited"]');
        const visitDateGroup = document.getElementById('visit-date-group');
        const ratingGroup = document.getElementById('rating-group');
        
        // Удаление музея
        deleteBtn.addEventListener('click', () => {
            showConfirmModal(`Вы уверены, что хотите удалить музей "${museum.name}"?`, async () => {
                try {
                    await MuseumAPI.deleteMuseum(museum.id);
                    showNotification('success', 'Успешно', `Музей "${museum.name}" удален`);
                    Router.navigate('#/items');
                } catch (error) {
                    showNotification('error', 'Ошибка', 'Не удалось удалить музей');
                }
            });
        });
        
        // Переключение видимости полей даты и оценки
        visitedRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'true') {
                    visitDateGroup.style.display = 'block';
                    ratingGroup.style.display = 'block';
                } else {
                    visitDateGroup.style.display = 'none';
                    ratingGroup.style.display = 'none';
                }
            });
        });
        
        // Обновление статуса посещения
        visitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(visitForm);
            const visited = formData.get('visited');
            const visitDate = formData.get('visitDate');
            const rating = formData.get('rating');
            
            const submitBtn = visitForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
            submitBtn.disabled = true;
            
            try {
                await MuseumAPI.updateVisitStatus(museum.id, visited, visitDate, rating);
                showNotification('success', 'Успешно', 'Статус посещения обновлен');
                
                // Обновление данных на странице
                const updatedMuseum = await MuseumAPI.getMuseumById(museum.id);
                renderMuseumDetail(updatedMuseum);
            } catch (error) {
                showNotification('error', 'Ошибка', 'Не удалось обновить статус посещения');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    };
    
    // Показать форму создания музея
    const showCreateForm = () => {
        renderMuseumForm();
    };
    
    // Показать форму редактирования музея
    const showEditForm = async (params) => {
        showLoading();
        
        try {
            const museum = await MuseumAPI.getMuseumById(params.id);
            renderMuseumForm(museum);
        } catch (error) {
            showError(error.message);
        }
    };
    
    // Рендер формы музея (создание/редактирование)
    const renderMuseumForm = (museum = null) => {
        const isEditMode = !!museum;
        const title = isEditMode ? `Редактирование музея "${museum.name}"` : 'Добавление нового музея';
        
        const content = document.getElementById('content');
        
        const html = `
            <div class="form-container">
                <div class="form-header">
                    <h2 class="form-title">${title}</h2>
                </div>
                
                <form id="museum-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="name" class="form-label">Название музея *</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                class="form-control" 
                                value="${museum ? museum.name : ''}"
                                required
                            >
                            <div class="form-error" id="name-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="city" class="form-label">Город *</label>
                            <input 
                                type="text" 
                                id="city" 
                                name="city" 
                                class="form-control" 
                                value="${museum ? museum.city : ''}"
                                required
                            >
                            <div class="form-error" id="city-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="address" class="form-label">Адрес *</label>
                            <input 
                                type="text" 
                                id="address" 
                                name="address" 
                                class="form-control" 
                                value="${museum ? museum.address : ''}"
                                required
                            >
                            <div class="form-error" id="address-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="category" class="form-label">Категория *</label>
                            <select id="category" name="category" class="form-control" required>
                                <option value="">Выберите категорию</option>
                                <option value="Искусство" ${museum && museum.category === 'Искусство' ? 'selected' : ''}>Искусство</option>
                                <option value="История" ${museum && museum.category === 'История' ? 'selected' : ''}>История</option>
                                <option value="Наука и техника" ${museum && museum.category === 'Наука и техника' ? 'selected' : ''}>Наука и техника</option>
                                <option value="Естествознание" ${museum && museum.category === 'Естествознание' ? 'selected' : ''}>Естествознание</option>
                                <option value="Краеведение" ${museum && museum.category === 'Краеведение' ? 'selected' : ''}>Краеведение</option>
                                <option value="Другое" ${museum && museum.category === 'Другое' ? 'selected' : ''}>Другое</option>
                            </select>
                            <div class="form-error" id="category-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="founded" class="form-label">Год основания</label>
                            <input 
                                type="number" 
                                id="founded" 
                                name="founded" 
                                class="form-control" 
                                min="1000" 
                                max="${new Date().getFullYear()}"
                                value="${museum ? museum.founded : ''}"
                            >
                            <div class="form-error" id="founded-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="website" class="form-label">Веб-сайт</label>
                            <input 
                                type="url" 
                                id="website" 
                                name="website" 
                                class="form-control" 
                                value="${museum ? museum.website : ''}"
                                placeholder="https://example.com"
                            >
                            <div class="form-error" id="website-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="description" class="form-label">Описание *</label>
                        <textarea 
                            id="description" 
                            name="description" 
                            class="form-control" 
                            required
                        >${museum ? museum.description : ''}</textarea>
                        <div class="form-error" id="description-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <div class="form-label">Вы уже посещали этот музей?</div>
                        <div>
                            <label>
                                <input type="radio" name="visited" value="true" ${museum && museum.visited ? 'checked' : ''}>
                                Да, был
                            </label>
                            <label style="margin-left: 1rem;">
                                <input type="radio" name="visited" value="false" ${museum && !museum.visited ? 'checked' : !museum ? 'checked' : ''}>
                                Нет, не был
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-save"></i> ${isEditMode ? 'Обновить' : 'Создать'}
                        </button>
                        <a href="${isEditMode ? `#/items/${museum.id}` : '#/items'}" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Отмена
                        </a>
                    </div>
                </form>
            </div>
        `;
        
        content.innerHTML = html;
        
        // Обработчик отправки формы
        const form = document.getElementById('museum-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Очистка ошибок
            clearFormErrors();
            
            // Валидация формы
            if (!validateForm()) {
                return;
            }
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
            submitBtn.disabled = true;
            
            try {
                if (isEditMode) {
                    await MuseumAPI.updateMuseum(museum.id, data);
                    showNotification('success', 'Успешно', `Музей "${data.name}" обновлен`);
                    Router.navigate(`#/items/${museum.id}`);
                } else {
                    const newMuseum = await MuseumAPI.createMuseum(data);
                    showNotification('success', 'Успешно', `Музей "${newMuseum.name}" создан`);
                    Router.navigate(`#/items/${newMuseum.id}`);
                }
            } catch (error) {
                showNotification('error', 'Ошибка', 'Не удалось сохранить музей');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    };
    
    // Валидация формы
    const validateForm = () => {
        let isValid = true;
        
        // Проверка обязательных полей
        const requiredFields = ['name', 'city', 'address', 'category', 'description'];
        
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const errorElement = document.getElementById(`${fieldName}-error`);
            
            if (!field.value.trim()) {
                errorElement.textContent = 'Это поле обязательно для заполнения';
                field.classList.add('error');
                isValid = false;
            } else {
                errorElement.textContent = '';
                field.classList.remove('error');
            }
        });
        
        // Проверка года основания
        const foundedField = document.getElementById('founded');
        const foundedError = document.getElementById('founded-error');
        
        if (foundedField.value) {
            const year = parseInt(foundedField.value);
            const currentYear = new Date().getFullYear();
            
            if (year < 1000 || year > currentYear) {
                foundedError.textContent = `Год должен быть между 1000 и ${currentYear}`;
                foundedField.classList.add('error');
                isValid = false;
            }
        }
        
        // Проверка URL
        const websiteField = document.getElementById('website');
        const websiteError = document.getElementById('website-error');
        
        if (websiteField.value && !isValidUrl(websiteField.value)) {
            websiteError.textContent = 'Введите корректный URL (начинается с http:// или https://)';
            websiteField.classList.add('error');
            isValid = false;
        }
        
        return isValid;
    };
    
    // Проверка валидности URL
    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };
    
    // Очистка ошибок формы
    const clearFormErrors = () => {
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(el => {
            el.textContent = '';
        });
        
        const errorFields = document.querySelectorAll('.form-control.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
    };
    
    return {
        init
    };
})();

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});