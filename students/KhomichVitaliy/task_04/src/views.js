// Модуль представлений (Views)
import api from './api.js';
import router from './router.js';

class Views {
    constructor() {
        this.appContent = document.getElementById('app-content');
        this.notification = document.getElementById('notification');
        this.notificationMessage = document.getElementById('notificationMessage');
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmMessage = document.getElementById('confirmMessage');
        this.confirmOk = document.getElementById('confirmOk');
        this.confirmCancel = document.getElementById('confirmCancel');
        
        // Текущие параметры
        this.currentFilters = {};
        
        // Инициализация
        this.setupModal();
        this.setupGlobalSearch();
        this.setupResetButton();
        
        console.log('Views module initialized');
    }
    
    setupModal() {
        const modalClose = this.confirmModal.querySelector('.modal-close');
        const notificationClose = this.notification.querySelector('.notification-close');
        
        modalClose.addEventListener('click', () => this.hideModal());
        notificationClose.addEventListener('click', () => this.hideNotification());
        this.confirmCancel.addEventListener('click', () => this.hideModal());
        
        // Закрытие по клику вне модального окна
        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) {
                this.hideModal();
            }
        });
        
        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.confirmModal.classList.contains('hidden')) {
                this.hideModal();
            }
        });
    }
    
    setupGlobalSearch() {
        const searchInput = document.getElementById('globalSearch');
        
        if (!searchInput) return;
        
        // Восстановление поиска при загрузке
        const searchParam = router.getQueryParam('search');
        if (searchParam) {
            searchInput.value = searchParam;
        }
        
        // Дебаунс поиска
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const search = e.target.value.trim();
                if (router.getCurrentPath().startsWith('/hackathons')) {
                    router.updateQueryParams({ 
                        search: search || undefined, 
                        page: 1 
                    });
                } else {
                    router.navigate('/hackathons', { 
                        search: search || undefined 
                    });
                }
            }, 500);
        });
    }
    
    setupResetButton() {
        const resetBtn = document.getElementById('resetData');
        if (resetBtn) {
            resetBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                this.showConfirmModal(
                    'Вы уверены, что хотите сбросить все данные? Все созданные хакатоны будут удалены и восстановлены исходные данные. Это действие нельзя отменить.',
                    async () => {
                        try {
                            await api.resetToInitial();
                            this.showNotification('Данные успешно сброшены к исходным', 'success');
                            router.navigate('/hackathons');
                        } catch (error) {
                            this.showNotification(`Ошибка сброса данных: ${error.message}`, 'error');
                        }
                    }
                );
            });
        }
    }
    
    // Показать уведомление
    showNotification(message, type = 'info', duration = 5000) {
        this.notificationMessage.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.classList.remove('hidden');
        
        // Автоматическое скрытие
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification();
            }, duration);
        }
    }
    
    // Скрыть уведомление
    hideNotification() {
        this.notification.classList.add('hidden');
    }
    
    // Показать модальное окно подтверждения
    showConfirmModal(message, onConfirm) {
        this.confirmMessage.textContent = message;
        this.confirmModal.classList.remove('hidden');
        
        // Блокируем прокрутку фона
        document.body.style.overflow = 'hidden';
        
        // Обработчик подтверждения
        const confirmHandler = () => {
            if (onConfirm) onConfirm();
            this.hideModal();
        };
        
        // Удаляем старые обработчики и добавляем новые
        this.confirmOk.replaceWith(this.confirmOk.cloneNode(true));
        this.confirmOk = document.getElementById('confirmOk');
        this.confirmOk.addEventListener('click', confirmHandler);
    }
    
    // Скрыть модальное окно
    hideModal() {
        this.confirmModal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Удаляем все обработчики с кнопки подтверждения
        this.confirmOk.replaceWith(this.confirmOk.cloneNode(true));
        this.confirmOk = document.getElementById('confirmOk');
    }
    
    // Рендеринг экрана
    renderScreen(content) {
        this.appContent.innerHTML = content;
        this.attachLinkListeners();
        
        // Прокрутка к верху
        window.scrollTo(0, 0);
    }
    
    // Прикрепление обработчиков к ссылкам
    attachLinkListeners() {
        // Обработка всех ссылок с data-link
        this.appContent.querySelectorAll('[data-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href) {
                    router.navigate(href.slice(1)); // Убираем #
                }
            });
        });
    }
    
    // Главный экран
    renderHome() {
        const content = `
            <div class="welcome-screen">
                <div class="welcome-content">
                    <h1><i class="fas fa-laptop-code"></i> База хакатонов</h1>
                    <p>Управляйте хакатонами, отслеживайте участников и создавайте новые события</p>
                    
                    <div class="quick-stats" style="margin: 30px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                        <div class="stat-card" style="text-align: center;">
                            <h4>Хакатонов в базе</h4>
                            <div class="stat-value" id="homeTotalHackathons">Загрузка...</div>
                        </div>
                        <div class="stat-card" style="text-align: center;">
                            <h4>Всего участников</h4>
                            <div class="stat-value" id="homeTotalParticipants">Загрузка...</div>
                        </div>
                        <div class="stat-card" style="text-align: center;">
                            <h4>Общий призовой фонд</h4>
                            <div class="stat-value" id="homeTotalPrize">Загрузка...</div>
                        </div>
                    </div>
                    
                    <div class="welcome-actions">
                        <a href="#/hackathons" class="btn btn-primary" data-link>
                            <i class="fas fa-rocket"></i>
                            Смотреть хакатоны
                        </a>
                        <a href="#/new" class="btn btn-secondary" data-link>
                            <i class="fas fa-plus"></i>
                            Создать хакатон
                        </a>
                        <a href="#/stats" class="btn btn-outline" data-link>
                            <i class="fas fa-chart-bar"></i>
                            Статистика
                        </a>
                    </div>
                    
                    <div class="demo-info">
                        <p><i class="fas fa-info-circle"></i> Демо-режим: данные сохраняются в localStorage, запросы отправляются в JSONPlaceholder</p>
                    </div>
                </div>
            </div>
        `;
        
        this.renderScreen(content);
        
        // Загружаем статистику для главной страницы
        this.loadHomeStats();
    }
    
    // Загрузка статистики для главной
    async loadHomeStats() {
        try {
            const stats = await api.getStats();
            
            document.getElementById('homeTotalHackathons').textContent = stats.totalHackathons;
            document.getElementById('homeTotalParticipants').textContent = stats.totalParticipants.toLocaleString();
            document.getElementById('homeTotalPrize').textContent = stats.totalPrize.toLocaleString() + ' руб.';
        } catch (error) {
            console.error('Ошибка загрузки статистики для главной:', error);
        }
    }
    
    // Список хакатонов
    async renderHackathons(params = {}, query = {}) {
        // Сохраняем текущие фильтры
        this.currentFilters = { ...query };
        
        // Показываем индикатор загрузки
        this.renderScreen(`
            <div class="screen">
                <div class="screen-header">
                    <h2><i class="fas fa-list"></i> Все хакатоны</h2>
                    <div class="screen-actions">
                        <a href="#/new" class="btn btn-primary" data-link>
                            <i class="fas fa-plus"></i>
                            Новый хакатон
                        </a>
                    </div>
                </div>
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>Загрузка хакатонов...</p>
                </div>
            </div>
        `);
        
        try {
            // Получаем данные
            const data = await api.getHackathons(query);
            
            // Получаем категории для фильтров
            const categories = await api.getCategories();
            const statuses = await api.getStatuses();
            
            // Если нет данных
            if (data.total === 0) {
                this.renderEmptyState(query);
                return;
            }
            
            // Генерация HTML для карточек хакатонов
            let hackathonsHTML = '';
            
            data.data.forEach(hackathon => {
                const startDate = new Date(hackathon.startDate).toLocaleDateString('ru-RU');
                const endDate = new Date(hackathon.endDate).toLocaleDateString('ru-RU');
                const participantsProgress = Math.round((hackathon.currentParticipants / hackathon.maxParticipants) * 100);
                const statusLabels = {
                    'upcoming': 'Предстоящий',
                    'ongoing': 'Идет сейчас',
                    'completed': 'Завершен'
                };
                
                hackathonsHTML += `
                    <div class="hackathon-card new-item">
                        <div class="card-header">
                            <span class="card-category">${hackathon.category}</span>
                            <div class="card-status ${hackathon.status}">
                                ${statusLabels[hackathon.status] || hackathon.status}
                            </div>
                            <h3>${hackathon.title}</h3>
                            <div class="card-dates">
                                <i class="far fa-calendar-alt"></i>
                                <span>${startDate} - ${endDate}</span>
                            </div>
                        </div>
                        <div class="card-content">
                            <p class="card-description">${hackathon.description}</p>
                            <div class="card-details">
                                <div class="card-detail">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${hackathon.location}</span>
                                </div>
                                <div class="card-detail">
                                    <i class="fas fa-trophy"></i>
                                    <span>${hackathon.prize.toLocaleString()} руб.</span>
                                </div>
                                <div class="card-detail">
                                    <i class="fas fa-users"></i>
                                    <span>${hackathon.currentParticipants}/${hackathon.maxParticipants}</span>
                                </div>
                                <div class="card-detail">
                                    <i class="fas fa-building"></i>
                                    <span>${hackathon.organizer}</span>
                                </div>
                            </div>
                            <div style="margin: 15px 0;">
                                <div class="progress" style="height: 8px; background-color: #e9ecef; border-radius: 4px;">
                                    <div class="progress-bar" style="width: ${participantsProgress}%; height: 100%; background-color: #238636; border-radius: 4px;"></div>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #6c757d; margin-top: 5px;">
                                    <span>Заполнено: ${participantsProgress}%</span>
                                    <span>Осталось мест: ${hackathon.maxParticipants - hackathon.currentParticipants}</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-actions">
                            <a href="#/hackathons/${hackathon.id}" class="btn btn-outline btn-small" data-link>
                                <i class="fas fa-eye"></i>
                                Подробнее
                            </a>
                            <div>
                                <a href="#/hackathons/${hackathon.id}/edit" class="btn btn-secondary btn-small" data-link>
                                    <i class="fas fa-edit"></i>
                                </a>
                                <button class="btn btn-danger btn-small delete-btn" data-id="${hackathon.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // Пагинация
            let paginationHTML = '';
            if (data.totalPages > 1) {
                paginationHTML = `
                    <div class="pagination">
                        <button class="btn btn-pagination ${!data.hasPrevPage ? 'disabled' : ''}" 
                                ${!data.hasPrevPage ? 'disabled' : ''}
                                onclick="router.navigate('/hackathons', { ...${JSON.stringify(query)}, page: ${data.page - 1} })">
                            <i class="fas fa-chevron-left"></i> Назад
                        </button>
                        <span class="page-info">Страница ${data.page} из ${data.totalPages} (всего: ${data.total})</span>
                        <button class="btn btn-pagination ${!data.hasNextPage ? 'disabled' : ''}" 
                                ${!data.hasNextPage ? 'disabled' : ''}
                                onclick="router.navigate('/hackathons', { ...${JSON.stringify(query)}, page: ${data.page + 1} })">
                            Вперед <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                `;
            }
            
            // Опции фильтров
            const categoryOptions = categories.map(cat => `
                <option value="${cat.name}" ${query.category === cat.name ? 'selected' : ''}>
                    ${cat.name} (${cat.count})
                </option>
            `).join('');
            
            const statusOptions = statuses.map(status => `
                <option value="${status.name}" ${query.status === status.name ? 'selected' : ''}>
                    ${status.label}
                </option>
            `).join('');
            
            const sortOptions = [
                { value: 'newest', label: 'Сначала новые' },
                { value: 'oldest', label: 'Сначала старые' },
                { value: 'prize_high', label: 'Призовой фонд (по убыванию)' },
                { value: 'prize_low', label: 'Призовой фонд (по возрастанию)' },
                { value: 'date_asc', label: 'Дата (ближайшие)' },
                { value: 'date_desc', label: 'Дата (поздние)' }
            ].map(opt => `
                <option value="${opt.value}" ${query.sort === opt.value ? 'selected' : ''}>
                    ${opt.label}
                </option>
            `).join('');
            
            const content = `
                <div class="screen">
                    <div class="screen-header">
                        <h2><i class="fas fa-list"></i> Все хакатоны</h2>
                        <div class="screen-actions">
                            <a href="#/new" class="btn btn-primary" data-link>
                                <i class="fas fa-plus"></i>
                                Новый хакатон
                            </a>
                        </div>
                    </div>
                    
                    <div class="filters-section">
                        <div class="filters-header">
                            <h3><i class="fas fa-filter"></i> Фильтры и сортировка</h3>
                            ${query.search ? `<div class="search-info">Поиск: "${query.search}"</div>` : ''}
                        </div>
                        
                        <div class="filters-grid">
                            <div class="form-group">
                                <label for="categoryFilter">Категория:</label>
                                <select id="categoryFilter" class="form-control">
                                    <option value="all">Все категории</option>
                                    ${categoryOptions}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="statusFilter">Статус:</label>
                                <select id="statusFilter" class="form-control">
                                    <option value="all">Все статусы</option>
                                    ${statusOptions}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="sortFilter">Сортировка:</label>
                                <select id="sortFilter" class="form-control">
                                    ${sortOptions}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="limitFilter">На странице:</label>
                                <select id="limitFilter" class="form-control">
                                    <option value="6" ${query.limit === '6' ? 'selected' : ''}>6</option>
                                    <option value="12" ${query.limit === '12' ? 'selected' : ''}>12</option>
                                    <option value="24" ${query.limit === '24' ? 'selected' : ''}>24</option>
                                    <option value="50" ${query.limit === '50' ? 'selected' : ''}>50</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="filter-actions">
                            <button id="clearFilters" class="btn btn-outline">
                                <i class="fas fa-times"></i>
                                Сбросить фильтры
                            </button>
                        </div>
                    </div>
                    
                    <div class="results-info">
                        <p>Найдено хакатонов: <strong>${data.total}</strong></p>
                    </div>
                    
                    <div class="hackathons-grid">
                        ${hackathonsHTML}
                    </div>
                    
                    ${paginationHTML}
                </div>
            `;
            
            this.renderScreen(content);
            
            // Обработчики фильтров
            this.setupFilterHandlers(query);
            
            // Обработчики удаления
            this.setupDeleteHandlers();
            
        } catch (error) {
            console.error('Ошибка загрузки хакатонов:', error);
            this.renderErrorState(error, 'hackathons');
        }
    }
    
    // Настройка обработчиков фильтров
    setupFilterHandlers(currentQuery) {
        const filters = ['categoryFilter', 'statusFilter', 'sortFilter', 'limitFilter'];
        
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', (e) => {
                    const newQuery = { ...currentQuery };
                    const value = e.target.value;
                    
                    // Удаляем параметр если значение 'all' или по умолчанию
                    if (filterId === 'categoryFilter' && value === 'all') {
                        delete newQuery.category;
                    } else if (filterId === 'statusFilter' && value === 'all') {
                        delete newQuery.status;
                    } else if (filterId === 'limitFilter') {
                        newQuery.limit = value;
                        newQuery.page = 1; // Сбрасываем на первую страницу при изменении лимита
                    } else {
                        newQuery[filterId.replace('Filter', '')] = value;
                    }
                    
                    router.updateQueryParams(newQuery);
                });
            }
        });
        
        // Обработчик сброса фильтров
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                router.navigate('/hackathons');
            });
        }
    }
    
    // Настройка обработчиков удаления
    setupDeleteHandlers() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = e.currentTarget.dataset.id;
                await this.handleDeleteHackathon(id);
            });
        });
    }
    
    // Пустое состояние
    renderEmptyState(query = {}) {
        const content = `
            <div class="screen">
                <div class="screen-header">
                    <h2><i class="fas fa-list"></i> Все хакатоны</h2>
                    <div class="screen-actions">
                        <a href="#/new" class="btn btn-primary" data-link>
                            <i class="fas fa-plus"></i>
                            Новый хакатон
                        </a>
                    </div>
                </div>
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>Хакатоны не найдены</h3>
                    ${query.search ? `<p>По запросу "${query.search}" ничего не найдено</p>` : ''}
                    ${query.category ? `<p>В категории "${query.category}" пока нет хакатонов</p>` : ''}
                    <p>Попробуйте изменить параметры поиска или создайте новый хакатон</p>
                    <div class="empty-actions" style="margin-top: 30px;">
                        <button onclick="router.navigate('/hackathons')" class="btn btn-outline">
                            <i class="fas fa-times"></i>
                            Сбросить фильтры
                        </button>
                        <a href="#/new" class="btn btn-primary" data-link>
                            <i class="fas fa-plus"></i>
                            Создать хакатон
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        this.renderScreen(content);
    }
    
    // Состояние ошибки
    renderErrorState(error, context = '') {
        const content = `
            <div class="screen">
                <div class="screen-header">
                    <h2><i class="fas fa-list"></i> Все хакатоны</h2>
                </div>
                <div class="error-indicator">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <h3>Ошибка загрузки</h3>
                    <p>${error.message || 'Неизвестная ошибка'}</p>
                    <div class="error-actions" style="margin-top: 20px;">
                        <button onclick="router.navigate('/${context}')" class="btn btn-primary">
                            <i class="fas fa-redo"></i>
                            Попробовать снова
                        </button>
                        <a href="#/" class="btn btn-outline" data-link>
                            <i class="fas fa-home"></i>
                            На главную
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        this.renderScreen(content);
    }
    
    // Детали хакатона
    async renderHackathonDetail(params) {
        const id = params.id;
        
        // Показываем индикатор загрузки
        this.renderScreen(`
            <div class="screen">
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>Загрузка информации о хакатоне...</p>
                </div>
            </div>
        `);
        
        try {
            const hackathon = await api.getHackathon(id);
            
            const startDate = new Date(hackathon.startDate).toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const endDate = new Date(hackathon.endDate).toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const createdAt = new Date(hackathon.createdAt).toLocaleDateString('ru-RU');
            const participantsProgress = Math.round((hackathon.currentParticipants / hackathon.maxParticipants) * 100);
            
            const statusLabels = {
                'upcoming': 'Предстоящий',
                'ongoing': 'Идет сейчас',
                'completed': 'Завершен'
            };
            
            const statusColors = {
                'upcoming': '#2ea043',
                'ongoing': '#d29922',
                'completed': '#8b949e'
            };
            
            const content = `
                <div class="detail-container new-item">
                    <div class="detail-header">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <span class="detail-category">${hackathon.category}</span>
                            <span class="detail-status" style="background-color: ${statusColors[hackathon.status]}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">
                                ${statusLabels[hackathon.status] || hackathon.status}
                            </span>
                        </div>
                        <h2>${hackathon.title}</h2>
                        <div class="detail-meta">
                            <div class="detail-meta-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${hackathon.location}</span>
                            </div>
                            <div class="detail-meta-item">
                                <i class="far fa-calendar-alt"></i>
                                <span>${startDate} - ${endDate}</span>
                            </div>
                            <div class="detail-meta-item">
                                <i class="fas fa-trophy"></i>
                                <span>Призовой фонд: ${hackathon.prize.toLocaleString()} руб.</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-content">
                        <div class="detail-section">
                            <h3><i class="fas fa-info-circle"></i> Описание</h3>
                            <p>${hackathon.description}</p>
                        </div>
                        
                        ${hackathon.requirements ? `
                        <div class="detail-section">
                            <h3><i class="fas fa-clipboard-list"></i> Требования к участникам</h3>
                            <p>${hackathon.requirements}</p>
                        </div>
                        ` : ''}
                        
                        <div class="detail-section">
                            <h3><i class="fas fa-chart-bar"></i> Статистика</h3>
                            <div class="detail-stats">
                                <div class="stat-card">
                                    <h4>Участники</h4>
                                    <div class="stat-value">${hackathon.currentParticipants}/${hackathon.maxParticipants}</div>
                                    <div class="progress" style="margin-top: 10px;">
                                        <div class="progress-bar" style="width: ${participantsProgress}%; height: 6px; background-color: #238636; border-radius: 3px;"></div>
                                    </div>
                                    <p style="margin-top: 5px; font-size: 0.9rem; color: #6c757d;">
                                        Заполнено на ${participantsProgress}%
                                    </p>
                                </div>
                                <div class="stat-card">
                                    <h4>Призовой фонд</h4>
                                    <div class="stat-value">${hackathon.prize.toLocaleString()} руб.</div>
                                </div>
                                <div class="stat-card">
                                    <h4>Организатор</h4>
                                    <div class="stat-value">${hackathon.organizer}</div>
                                </div>
                                <div class="stat-card">
                                    <h4>Дата создания</h4>
                                    <div class="stat-value">${createdAt}</div>
                                </div>
                            </div>
                        </div>
                        
                        ${hackathon.website ? `
                        <div class="detail-section">
                            <h3><i class="fas fa-link"></i> Ссылки</h3>
                            <p>
                                <a href="${hackathon.website}" target="_blank" class="btn btn-outline">
                                    <i class="fas fa-external-link-alt"></i>
                                    Официальный сайт хакатона
                                </a>
                            </p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="detail-actions">
                        <a href="#/hackathons" class="btn btn-outline" data-link>
                            <i class="fas fa-arrow-left"></i>
                            Назад к списку
                        </a>
                        <a href="#/hackathons/${id}/edit" class="btn btn-secondary" data-link>
                            <i class="fas fa-edit"></i>
                            Редактировать
                        </a>
                        <button class="btn btn-danger delete-btn" data-id="${id}">
                            <i class="fas fa-trash"></i>
                            Удалить
                        </button>
                    </div>
                </div>
            `;
            
            this.renderScreen(content);
            
            // Обработчик удаления
            const deleteBtn = document.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                this.handleDeleteHackathon(id);
            });
            
        } catch (error) {
            console.error('Ошибка загрузки хакатона:', error);
            this.renderScreen(`
                <div class="screen">
                    <div class="error-indicator">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                        <h3>Ошибка загрузки хакатона</h3>
                        <p>${error.message}</p>
                        <div class="error-actions" style="margin-top: 20px;">
                            <a href="#/hackathons" class="btn btn-primary" data-link>
                                <i class="fas fa-arrow-left"></i>
                                Вернуться к списку
                            </a>
                            <a href="#/" class="btn btn-outline" data-link>
                                <i class="fas fa-home"></i>
                                На главную
                            </a>
                        </div>
                    </div>
                </div>
            `);
        }
    }
    
    // Форма создания/редактирования хакатона
    async renderHackathonForm(params = {}) {
        const isEdit = !!params.id;
        const id = params.id;
        let hackathon = null;
        let loadingError = null;
        
        if (isEdit) {
            // Показываем индикатор загрузки для редактирования
            this.renderScreen(`
                <div class="screen">
                    <div class="loading-indicator">
                        <div class="spinner"></div>
                        <p>Загрузка данных хакатона...</p>
                    </div>
                </div>
            `);
            
            try {
                hackathon = await api.getHackathon(id);
            } catch (error) {
                console.error('Ошибка загрузки хакатона:', error);
                loadingError = error;
            }
        }
        
        // Если ошибка при загрузке для редактирования
        if (isEdit && loadingError) {
            this.renderScreen(`
                <div class="screen">
                    <div class="error-indicator">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                        <h3>Ошибка загрузки хакатона</h3>
                        <p>${loadingError.message}</p>
                        <div class="error-actions" style="margin-top: 20px;">
                            <a href="#/hackathons" class="btn btn-primary" data-link>
                                <i class="fas fa-arrow-left"></i>
                                Вернуться к списку
                            </a>
                        </div>
                    </div>
                </div>
            `);
            return;
        }
        
        // Получаем категории для выпадающего списка
        const categoriesData = await api.getCategories();
        const categories = categoriesData.map(cat => cat.name);
        const categoriesOptions = categories.map(cat => 
            `<option value="${cat}" ${hackathon?.category === cat ? 'selected' : ''}>${cat}</option>`
        ).join('');
        
        // Минимальная дата (сегодня)
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const content = `
            <div class="screen">
                <div class="form-container new-item">
                    <div class="form-header">
                        <h2>
                            <i class="fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}"></i>
                            ${isEdit ? 'Редактирование хакатона' : 'Создание нового хакатона'}
                        </h2>
                        ${isEdit ? `<p class="form-subtitle">Редактирование хакатона ID: ${id}</p>` : ''}
                    </div>
                    
                    <form id="hackathonForm" novalidate>
                        <div class="form-group">
                            <label for="title">
                                Название хакатона 
                                <span class="label-hint">(обязательно, минимум 3 символа)</span>
                            </label>
                            <input 
                                type="text" 
                                id="title" 
                                name="title" 
                                class="form-control" 
                                value="${hackathon?.title || ''}"
                                required
                                minlength="3"
                                maxlength="100"
                                placeholder="Введите название хакатона"
                            >
                            <div class="error-message" id="titleError"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="description">
                                Описание 
                                <span class="label-hint">(обязательно, минимум 10 символов)</span>
                            </label>
                            <textarea 
                                id="description" 
                                name="description" 
                                class="form-control" 
                                rows="4"
                                required
                                minlength="10"
                                placeholder="Опишите хакатон, его цели и задачи"
                            >${hackathon?.description || ''}</textarea>
                            <div class="error-message" id="descriptionError"></div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="category">Категория <span class="label-hint">(обязательно)</span></label>
                                <select id="category" name="category" class="form-control" required>
                                    <option value="">Выберите категорию</option>
                                    ${categoriesOptions}
                                    <option value="other" ${!hackathon?.category || categories.includes(hackathon.category) ? '' : 'selected'}>
                                        Другая
                                    </option>
                                </select>
                                <div class="error-message" id="categoryError"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="location">Место проведения <span class="label-hint">(обязательно)</span></label>
                                <input 
                                    type="text" 
                                    id="location" 
                                    name="location" 
                                    class="form-control" 
                                    value="${hackathon?.location || ''}"
                                    required
                                    placeholder="Например: Москва или Онлайн"
                                >
                                <div class="error-message" id="locationError"></div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="startDate">Дата начала <span class="label-hint">(обязательно)</span></label>
                                <input 
                                    type="date" 
                                    id="startDate" 
                                    name="startDate" 
                                    class="form-control" 
                                    value="${hackathon?.startDate || today}"
                                    required
                                    min="${today}"
                                >
                                <div class="error-message" id="startDateError"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="endDate">Дата окончания <span class="label-hint">(обязательно)</span></label>
                                <input 
                                    type="date" 
                                    id="endDate" 
                                    name="endDate" 
                                    class="form-control" 
                                    value="${hackathon?.endDate || tomorrow}"
                                    required
                                    min="${tomorrow}"
                                >
                                <div class="error-message" id="endDateError"></div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="prize">Призовой фонд (руб.)</label>
                                <input 
                                    type="number" 
                                    id="prize" 
                                    name="prize" 
                                    class="form-control" 
                                    value="${hackathon?.prize || '0'}"
                                    min="0"
                                    step="1000"
                                    placeholder="0"
                                >
                                <div class="error-message" id="prizeError"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="maxParticipants">Максимальное число участников</label>
                                <input 
                                    type="number" 
                                    id="maxParticipants" 
                                    name="maxParticipants" 
                                    class="form-control" 
                                    value="${hackathon?.maxParticipants || '50'}"
                                    min="1"
                                    max="1000"
                                    placeholder="50"
                                >
                                <div class="error-message" id="maxParticipantsError"></div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="organizer">Организатор</label>
                                <input 
                                    type="text" 
                                    id="organizer" 
                                    name="organizer" 
                                    class="form-control" 
                                    value="${hackathon?.organizer || ''}"
                                    placeholder="Название компании или организации"
                                >
                                <div class="error-message" id="organizerError"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="website">Веб-сайт</label>
                                <input 
                                    type="url" 
                                    id="website" 
                                    name="website" 
                                    class="form-control" 
                                    value="${hackathon?.website || ''}"
                                    placeholder="https://example.com"
                                >
                                <div class="error-message" id="websiteError"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="requirements">Требования к участникам</label>
                            <textarea 
                                id="requirements" 
                                name="requirements" 
                                class="form-control" 
                                rows="3"
                                placeholder="Какие навыки и опыт необходимы участникам?"
                            >${hackathon?.requirements || ''}</textarea>
                        </div>
                        
                        <div class="form-info">
                            <p><i class="fas fa-info-circle"></i> Все обязательные поля отмечены. При создании хакатона будет отправлен запрос к JSONPlaceholder API для демонстрации.</p>
                        </div>
                        
                        <div class="form-actions">
                            <a href="${isEdit ? `#/hackathons/${id}` : '#/hackathons'}" class="btn btn-outline" data-link>
                                <i class="fas fa-times"></i>
                                Отмена
                            </a>
                            <button type="submit" class="btn btn-primary" id="submitBtn">
                                <i class="fas fa-save"></i>
                                ${isEdit ? 'Обновить хакатон' : 'Создать хакатон'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        this.renderScreen(content);
        
        // Валидация дат
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => {
                endDateInput.min = startDateInput.value;
            });
        }
        
        // Обработчик формы
        const form = document.getElementById('hackathonForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit(isEdit, id);
        });
    }
    
    // Статистика
    async renderStats() {
        // Показываем индикатор загрузки
        this.renderScreen(`
            <div class="screen">
                <div class="screen-header">
                    <h2><i class="fas fa-chart-bar"></i> Статистика</h2>
                </div>
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>Загрузка статистики...</p>
                </div>
            </div>
        `);
        
        try {
            const stats = await api.getStats();
            
            // Статистика по категориям
            let categoriesHTML = '';
            Object.entries(stats.categories).forEach(([category, count]) => {
                const participants = stats.categoryParticipants[category] || 0;
                const totalPrize = stats.categoryPrizes[category] || 0;
                const avgPrize = count > 0 ? Math.round(totalPrize / count) : 0;
                
                categoriesHTML += `
                    <div class="stat-card">
                        <h4>${category}</h4>
                        <div class="stat-value">${count}</div>
                        <p class="stat-description">хакатонов</p>
                        <div class="stat-details" style="margin-top: 10px; font-size: 0.85rem;">
                            <div>Участников: ${participants}</div>
                            <div>Призовой фонд: ${totalPrize.toLocaleString()} руб.</div>
                            <div>Средний приз: ${avgPrize.toLocaleString()} руб.</div>
                        </div>
                    </div>
                `;
            });
            
            // Статистика по статусам
            let statusesHTML = '';
            Object.entries(stats.statuses).forEach(([status, count]) => {
                const statusLabels = {
                    'upcoming': 'Предстоящие',
                    'ongoing': 'Текущие',
                    'completed': 'Завершенные'
                };
                
                statusesHTML += `
                    <div class="stat-card" style="border-left-color: ${
                        status === 'upcoming' ? '#2ea043' : 
                        status === 'ongoing' ? '#d29922' : '#8b949e'
                    };">
                        <h4>${statusLabels[status] || status}</h4>
                        <div class="stat-value">${count}</div>
                        <p class="stat-description">хакатонов</p>
                    </div>
                `;
            });
            
            // Ближайшие хакатоны
            let upcomingHTML = '';
            if (stats.upcomingHackathons.length > 0) {
                upcomingHTML = stats.upcomingHackathons.map(h => {
                    const startDate = new Date(h.startDate).toLocaleDateString('ru-RU');
                    return `
                        <div class="hackathon-card" style="margin-bottom: 15px;">
                            <div class="card-header">
                                <span class="card-category">${h.category}</span>
                                <h3>${h.title}</h3>
                                <div class="card-dates">
                                    <i class="far fa-calendar-alt"></i>
                                    <span>${startDate}</span>
                                </div>
                            </div>
                            <div class="card-content">
                                <p class="card-description">${h.description.substring(0, 100)}...</p>
                                <div class="card-details">
                                    <div class="card-detail">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <span>${h.location}</span>
                                    </div>
                                    <div class="card-detail">
                                        <i class="fas fa-trophy"></i>
                                        <span>${h.prize.toLocaleString()} руб.</span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-actions">
                                <a href="#/hackathons/${h.id}" class="btn btn-outline btn-small" data-link>
                                    <i class="fas fa-eye"></i>
                                    Подробнее
                                </a>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                upcomingHTML = '<p class="empty-indicator" style="text-align: center; padding: 20px;">Нет предстоящих хакатонов</p>';
            }
            
            // Последние хакатоны
            let recentHTML = '';
            if (stats.recentHackathons.length > 0) {
                recentHTML = stats.recentHackathons.map(h => {
                    const createdAt = new Date(h.createdAt).toLocaleDateString('ru-RU');
                    return `
                        <div class="hackathon-card" style="margin-bottom: 15px;">
                            <div class="card-header">
                                <span class="card-category">${h.category}</span>
                                <h3>${h.title}</h3>
                                <div class="card-dates">
                                    <i class="far fa-calendar-alt"></i>
                                    <span>Создан: ${createdAt}</span>
                                </div>
                            </div>
                            <div class="card-content">
                                <p class="card-description">${h.description.substring(0, 100)}...</p>
                                <div class="card-details">
                                    <div class="card-detail">
                                        <i class="fas fa-users"></i>
                                        <span>${h.currentParticipants}/${h.maxParticipants}</span>
                                    </div>
                                    <div class="card-detail">
                                        <i class="fas fa-trophy"></i>
                                        <span>${h.prize.toLocaleString()} руб.</span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-actions">
                                <a href="#/hackathons/${h.id}" class="btn btn-outline btn-small" data-link>
                                    <i class="fas fa-eye"></i>
                                    Подробнее
                                </a>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                recentHTML = '<p class="empty-indicator" style="text-align: center; padding: 20px;">Нет недавних хакатонов</p>';
            }
            
            const content = `
                <div class="screen">
                    <div class="screen-header">
                        <h2><i class="fas fa-chart-bar"></i> Статистика</h2>
                        <div class="screen-actions">
                            <button onclick="window.print()" class="btn btn-outline">
                                <i class="fas fa-print"></i>
                                Печать
                            </button>
                        </div>
                    </div>
                    
                    <div class="stats-overview">
                        <div class="stats-grid">
                            <div class="stat-box">
                                <h3><i class="fas fa-laptop-code"></i> Всего хакатонов</h3>
                                <div class="stat-number">${stats.totalHackathons}</div>
                                <p class="stat-description">в базе данных</p>
                            </div>
                            
                            <div class="stat-box">
                                <h3><i class="fas fa-users"></i> Участников</h3>
                                <div class="stat-number">${stats.totalParticipants.toLocaleString()}</div>
                                <p class="stat-description">всего зарегистрировано</p>
                            </div>
                            
                            <div class="stat-box">
                                <h3><i class="fas fa-trophy"></i> Призовой фонд</h3>
                                <div class="stat-number">${stats.totalPrize.toLocaleString()}</div>
                                <p class="stat-description">рублей всего</p>
                            </div>
                            
                            <div class="stat-box">
                                <h3><i class="fas fa-money-bill-wave"></i> Средний приз</h3>
                                <div class="stat-number">${stats.avgPrize.toLocaleString()}</div>
                                <p class="stat-description">рублей на хакатон</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <h3><i class="fas fa-folder"></i> Распределение по категориям</h3>
                        <div class="stats-grid" style="margin-top: 20px;">
                            ${categoriesHTML}
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <h3><i class="fas fa-flag"></i> Распределение по статусам</h3>
                        <div class="stats-grid" style="margin-top: 20px;">
                            ${statusesHTML}
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <h3><i class="fas fa-calendar-alt"></i> Ближайшие хакатоны</h3>
                        <div style="margin-top: 20px;">
                            ${upcomingHTML}
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <h3><i class="fas fa-clock"></i> Недавно добавленные</h3>
                        <div style="margin-top: 20px;">
                            ${recentHTML}
                        </div>
                    </div>
                    
                    <div class="stats-footer">
                        <p><i class="fas fa-info-circle"></i> Статистика обновлена: ${new Date(stats.lastUpdated).toLocaleString('ru-RU')}</p>
                        <p><i class="fas fa-database"></i> Данные хранятся в localStorage, запросы отправляются в JSONPlaceholder API</p>
                    </div>
                </div>
            `;
            
            this.renderScreen(content);
            
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            this.renderScreen(`
                <div class="screen">
                    <div class="screen-header">
                        <h2><i class="fas fa-chart-bar"></i> Статистика</h2>
                    </div>
                    <div class="error-indicator">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                        <h3>Ошибка загрузки статистики</h3>
                        <p>${error.message}</p>
                        <div class="error-actions" style="margin-top: 20px;">
                            <button onclick="router.navigate('/stats')" class="btn btn-primary">
                                <i class="fas fa-redo"></i>
                                Попробовать снова
                            </button>
                            <a href="#/" class="btn btn-outline" data-link>
                                <i class="fas fa-home"></i>
                                На главную
                            </a>
                        </div>
                    </div>
                </div>
            `);
        }
    }
    
    // 404 - Страница не найдена
    renderNotFound() {
        const content = `
            <div class="screen">
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h2>404 - Страница не найдена</h2>
                    <p>Запрашиваемая страница не существует или была перемещена.</p>
                    <div class="empty-actions" style="margin-top: 30px;">
                        <a href="#/" class="btn btn-primary" data-link>
                            <i class="fas fa-home"></i>
                            На главную
                        </a>
                        <a href="#/hackathons" class="btn btn-outline" data-link>
                            <i class="fas fa-list"></i>
                            Все хакатоны
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        this.renderScreen(content);
    }
    
    // Обработчик отправки формы
    async handleFormSubmit(isEdit, id) {
        const form = document.getElementById('hackathonForm');
        const submitBtn = document.getElementById('submitBtn');
        
        if (!form || !submitBtn) return;
        
        // Сбрасываем ошибки
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });
        
        document.querySelectorAll('.form-control').forEach(el => {
            el.classList.remove('error');
        });
        
        // Получаем данные формы
        const formData = new FormData(form);
        const hackathonData = {};
        
        for (const [key, value] of formData.entries()) {
            hackathonData[key] = value;
        }
        
        // Валидация
        let isValid = true;
        const errors = [];
        
        if (!hackathonData.title || hackathonData.title.trim().length < 3) {
            this.showFieldError('title', 'Название должно содержать минимум 3 символа');
            errors.push('Название');
            isValid = false;
        }
        
        if (!hackathonData.description || hackathonData.description.trim().length < 10) {
            this.showFieldError('description', 'Описание должно содержать минимум 10 символов');
            errors.push('Описание');
            isValid = false;
        }
        
        if (!hackathonData.category) {
            this.showFieldError('category', 'Выберите категорию');
            errors.push('Категория');
            isValid = false;
        }
        
        if (!hackathonData.location) {
            this.showFieldError('location', 'Укажите место проведения');
            errors.push('Место проведения');
            isValid = false;
        }
        
        const startDate = new Date(hackathonData.startDate);
        const endDate = new Date(hackathonData.endDate);
        if (startDate >= endDate) {
            this.showFieldError('endDate', 'Дата окончания должна быть позже даты начала');
            errors.push('Даты');
            isValid = false;
        }
        
        if (!isValid) {
            this.showNotification(`Ошибка валидации: проверьте поля ${errors.join(', ')}`, 'error');
            return;
        }
        
        // Преобразование числовых полей
        hackathonData.prize = parseInt(hackathonData.prize) || 0;
        hackathonData.maxParticipants = parseInt(hackathonData.maxParticipants) || 50;
        
        // Блокируем кнопку отправки
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
        
        try {
            let result;
            
            if (isEdit) {
                console.log(`Редактируем хакатон ID: ${id}`);
                result = await api.updateHackathon(id, hackathonData);
                this.showNotification('Хакатон успешно обновлен', 'success');
            } else {
                console.log('Создаем новый хакатон');
                result = await api.createHackathon(hackathonData);
                this.showNotification('Хакатон успешно создан', 'success', 3000);
            }
            
            console.log('Хакатон сохранен:', result);
            
            // Перенаправляем на детали созданного/обновленного хакатона
            setTimeout(() => {
                router.navigate(`/hackathons/${result.id}`);
            }, 1500);
            
        } catch (error) {
            console.error('Ошибка сохранения хакатона:', error);
            this.showNotification(`Ошибка: ${error.message}`, 'error');
            
            // Разблокируем кнопку
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <i class="fas fa-save"></i>
                ${isEdit ? 'Обновить' : 'Создать'}
            `;
        }
    }
    
    // Показать ошибку поля
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${fieldId}Error`);
        
        if (field && errorEl) {
            field.classList.add('error');
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }
    
    // Обработчик удаления хакатона
    async handleDeleteHackathon(id) {
        try {
            const hackathon = await api.getHackathon(id);
            
            this.showConfirmModal(
                `Вы уверены, что хотите удалить хакатон "${hackathon.title}"? Это действие нельзя отменить.`,
                async () => {
                    try {
                        await api.deleteHackathon(id);
                        this.showNotification('Хакатон успешно удален', 'success');
                        
                        // Перенаправляем на список хакатонов
                        setTimeout(() => {
                            router.navigate('/hackathons');
                        }, 1000);
                        
                    } catch (error) {
                        console.error('Ошибка удаления хакатона:', error);
                        this.showNotification(`Ошибка удаления: ${error.message}`, 'error');
                    }
                }
            );
            
        } catch (error) {
            console.error('Ошибка получения данных хакатона:', error);
            this.showNotification(`Ошибка: ${error.message}`, 'error');
        }
    }
}

// Экспортируем singleton экземпляр
const viewsInstance = new Views();

// Для отладки делаем Views доступным глобально
if (typeof window !== 'undefined') {
    window.HackathonViews = viewsInstance;
}

export default viewsInstance;