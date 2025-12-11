import { NotificationManager } from '../utils/notifications.js';
import { ModalManager } from '../utils/notifications.js';

/**
 * Представление списка рецептов
 */
export class RecipesListView {
  constructor(store, api, router) {
    this.store = store;
    this.api = api;
    this.router = router;
    this.notifications = new NotificationManager(store);
    this.modals = new ModalManager();
    this.unsubscribe = null;

    this.elements = {
      app: document.getElementById('app'),
      searchInput: document.getElementById('search-input'),
      clearSearch: document.getElementById('clear-search'),
      categoryFilter: document.getElementById('category-filter'),
      difficultyFilter: document.getElementById('difficulty-filter'),
      timeFilter: document.getElementById('time-filter')
    };
  }

  /**
   * Рендеринг представления
   */
  render(params = {}, query = {}) {
    // Отписываемся от предыдущих обновлений
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Подписываемся на обновления store
    this.unsubscribe = this.store.subscribe((state) => {
      this.onStateChange(state);
    });

    // Инициализация элементов
    this.initElements();

    // Загрузка данных
    this.loadRecipes(query);
  }

  /**
   * Инициализация DOM элементов
   */
  initElements() {
    // Поиск с дебаунсом
    let searchTimeout;
    this.elements.searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const search = e.target.value.trim();
        this.store.updateFilters({ search });
        this.router.updateQuery({ search });
        this.loadRecipes();
      }, 300);
    });

    // Очистка поиска
    this.elements.clearSearch?.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.store.updateFilters({ search: '' });
      this.router.updateQuery({ search: '' });
      this.loadRecipes();
    });

    // Фильтр по категории
    this.elements.categoryFilter?.addEventListener('change', (e) => {
      const category = e.target.value;
      this.store.updateFilters({ category });
      this.router.updateQuery({ category });
      this.loadRecipes();
    });

    // Фильтр по сложности
    this.elements.difficultyFilter?.addEventListener('change', (e) => {
      const difficulty = e.target.value;
      this.store.updateFilters({ difficulty });
      this.router.updateQuery({ difficulty });
      this.loadRecipes();
    });

    // Фильтр по времени
    this.elements.timeFilter?.addEventListener('change', (e) => {
      const maxTime = e.target.value;
      this.store.updateFilters({ maxTime });
      this.router.updateQuery({ maxTime });
      this.loadRecipes();
    });

    // Восстановление фильтров из query
    const query = this.router.getQuery();
    if (query.search) {
      this.elements.searchInput.value = query.search;
    }
    if (query.category) {
      this.elements.categoryFilter.value = query.category;
    }
    if (query.difficulty) {
      this.elements.difficultyFilter.value = query.difficulty;
    }
    if (query.maxTime) {
      this.elements.timeFilter.value = query.maxTime;
    }
  }

  /**
   * Загрузка рецептов
   */
  async loadRecipes(query = {}) {
    try {
      this.store.setLoading(true);

      const state = this.store.state;
      const filters = { ...state.filters, ...query };
      const pagination = state.pagination;

      const apiFilters = this.store.getApiFilters();
      const recipes = await this.api.getRecipes({
        ...apiFilters,
        page: pagination.page,
        limit: pagination.limit
      });

      // Для json-server нужно обрабатывать заголовки для пагинации
      const total = parseInt(response.headers.get('x-total-count')) || recipes.length;
      const totalPages = Math.ceil(total / pagination.limit);

      this.store.setRecipes(recipes);
      this.store.updatePagination({ total, totalPages });

    } catch (error) {
      this.store.setError(error);
      this.notifications.error('Ошибка загрузки', 'Не удалось загрузить рецепты');
    }
  }

  /**
   * Обработчик изменения состояния
   */
  onStateChange(state) {
    if (state.loading) {
      this.renderLoading();
    } else if (state.error) {
      this.renderError(state.error);
    } else if (state.recipes.length === 0) {
      this.renderEmpty();
    } else {
      this.renderRecipes(state);
    }
  }

  /**
   * Рендеринг состояния загрузки
   */
  renderLoading() {
    this.elements.app.innerHTML = `
            <div class="loading-screen">
                <div class="spinner"></div>
                <p>Загрузка рецептов...</p>
            </div>
        `;
  }

  /**
   * Рендеринг ошибки
   */
  renderError(error) {
    this.elements.app.innerHTML = `
            <div class="error-state">
                <h2>😕 Ошибка загрузки</h2>
                <p>${error.message || 'Произошла ошибка при загрузке рецептов'}</p>
                <button id="retry-loading" class="btn btn-primary">
                    <i class="fas fa-redo"></i>
                    Попробовать снова
                </button>
            </div>
        `;

    document.getElementById('retry-loading')?.addEventListener('click', () => {
      this.loadRecipes();
    });
  }

  /**
   * Рендеринг пустого состояния
   */
  renderEmpty() {
    this.elements.app.innerHTML = `
            <div class="empty-state">
                <h2>📖 Рецепты не найдены</h2>
                <p>Попробуйте изменить параметры поиска или создайте новый рецепт</p>
                <div class="empty-actions">
                    <button id="reset-filters" class="btn btn-secondary">
                        <i class="fas fa-filter"></i>
                        Сбросить фильтры
                    </button>
                    <a href="#/recipes/new" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        Создать рецепт
                    </a>
                </div>
            </div>
        `;

    document.getElementById('reset-filters')?.addEventListener('click', () => {
      this.resetFilters();
    });
  }

  /**
   * Рендеринг списка рецептов
   */
  renderRecipes(state) {
    const { recipes, pagination, filters } = state;

    this.elements.app.innerHTML = `
            <div class="recipes-list-view">
                <div class="breadcrumbs">
                    <ul class="breadcrumbs-list">
                        <li class="breadcrumbs-item">
                            <a href="#/recipes" class="breadcrumbs-link active">Все рецепты</a>
                        </li>
                    </ul>
                </div>

                <div class="list-header">
                    <h1 class="page-title">Рецепты <span class="count">(${pagination.total})</span></h1>
                    <div class="header-actions">
                        <button id="sort-toggle" class="btn btn-text">
                            <i class="fas fa-sort-amount-down"></i>
                            Сортировка
                        </button>
                    </div>
                </div>

                ${filters.search || filters.category || filters.difficulty ? `
                    <div class="active-filters">
                        <div class="filters-summary">
                            <span>Активные фильтры:</span>
                            ${filters.search ? `<span class="filter-tag">Поиск: "${filters.search}"</span>` : ''}
                            ${filters.category ? `<span class="filter-tag">Категория: ${filters.category}</span>` : ''}
                            ${filters.difficulty ? `<span class="filter-tag">Сложность: ${filters.difficulty}</span>` : ''}
                            ${filters.maxTime ? `<span class="filter-tag">Время: до ${filters.maxTime} мин</span>` : ''}
                            <button id="clear-all-filters" class="btn btn-text">
                                <i class="fas fa-times"></i>
                                Очистить все
                            </button>
                        </div>
                    </div>
                ` : ''}

                <div class="recipes-grid" id="recipes-container">
                    ${recipes.map(recipe => this.renderRecipeCard(recipe)).join('')}
                </div>

                ${pagination.totalPages > 1 ? this.renderPagination(pagination) : ''}
            </div>
        `;

    // Инициализация событий
    this.initRecipeEvents();
    this.initPaginationEvents(pagination);

    if (document.getElementById('clear-all-filters')) {
      document.getElementById('clear-all-filters').addEventListener('click', () => {
        this.resetFilters();
      });
    }

    if (document.getElementById('sort-toggle')) {
      document.getElementById('sort-toggle').addEventListener('click', () => {
        this.showSortMenu();
      });
    }
  }

  /**
   * Рендеринг карточки рецепта
   */
  renderRecipeCard(recipe) {
    const difficultyClass = recipe.difficulty ? `difficulty-${recipe.difficulty}` : '';

    return `
            <div class="card recipe-card" data-id="${recipe.id}">
                <div class="recipe-image">
                    ${recipe.image ?
      `<img src="${recipe.image}" alt="${recipe.title}" loading="lazy">` :
      `<i class="fas fa-utensils"></i>`
    }
                    <div class="recipe-badge">
                        <span class="badge ${difficultyClass}">${this.getDifficultyText(recipe.difficulty)}</span>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <p class="recipe-description">${recipe.description.substring(0, 100)}${recipe.description.length > 100 ? '...' : ''}</p>

                    <div class="recipe-meta">
                        <span class="recipe-tag category">${recipe.category || 'Без категории'}</span>
                        <span class="recipe-tag">
                            <i class="fas fa-clock"></i> ${recipe.time || '?'} мин
                        </span>
                        <span class="recipe-tag">
                            <i class="fas fa-utensil-spoon"></i> ${recipe.ingredients?.length || 0} ингр.
                        </span>
                    </div>
                </div>
                <div class="card-footer">
                    <a href="#/recipes/${recipe.id}" class="btn btn-primary btn-small">
                        <i class="fas fa-eye"></i>
                        Просмотр
                    </a>
                    <div class="recipe-actions">
                        <a href="#/recipes/${recipe.id}/edit" class="btn btn-text btn-small" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-text btn-small btn-delete" title="Удалить" data-id="${recipe.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Рендеринг пагинации
   */
  renderPagination(pagination) {
    const { page, totalPages } = pagination;

    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return `
            <div class="pagination-wrapper">
                <div class="pagination">
                    <button class="btn btn-secondary ${page === 1 ? 'disabled' : ''}"
                            data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                        Назад
                    </button>

                    <div class="page-numbers">
                        ${pages.map(p =>
      p === '...' ?
        `<span class="page-dots">...</span>` :
        `<button class="page-number ${p === page ? 'active' : ''}"
                                        data-page="${p}">${p}</button>`
    ).join('')}
                    </div>

                    <button class="btn btn-secondary ${page === totalPages ? 'disabled' : ''}"
                            data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''}>
                        Вперед
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div class="pagination-info">
                    <span>Страница ${page} из ${totalPages}</span>
                    <select id="page-size" class="form-control" style="width: auto;">
                        <option value="12" ${pagination.limit === 12 ? 'selected' : ''}>12 на странице</option>
                        <option value="24" ${pagination.limit === 24 ? 'selected' : ''}>24 на странице</option>
                        <option value="48" ${pagination.limit === 48 ? 'selected' : ''}>48 на странице</option>
                    </select>
                </div>
            </div>
        `;
  }

  /**
   * Инициализация событий рецептов
   */
  initRecipeEvents() {
    // Удаление рецепта
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        await this.deleteRecipe(id);
      });
    });

    // Prefetch при наведении (бонус)
    document.querySelectorAll('.recipe-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        const id = card.dataset.id;
        // Можно предзагрузить детали рецепта
        // this.api.getRecipe(id).catch(() => {}); // Игнорируем ошибки
      });
    });
  }

  /**
   * Инициализация событий пагинации
   */
  initPaginationEvents(pagination) {
    // Переход по страницам
    document.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page >= 1 && page <= pagination.totalPages) {
          this.store.updatePagination({ page });
          this.loadRecipes();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Изменение количества на странице
    const pageSizeSelect = document.getElementById('page-size');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        const limit = parseInt(e.target.value);
        this.store.updatePagination({ limit, page: 1 });
        this.loadRecipes();
      });
    }
  }

  /**
   * Удаление рецепта
   */
  async deleteRecipe(id) {
    try {
      const confirmed = await this.modals.confirm(
        'Удаление рецепта',
        'Вы уверены, что хотите удалить этот рецепт? Это действие нельзя отменить.'
      );

      if (confirmed) {
        await this.api.deleteRecipe(id);

        // Удаляем из store
        const newRecipes = this.store.state.recipes.filter(r => r.id !== id);
        this.store.setRecipes(newRecipes);

        this.notifications.success('Успешно', 'Рецепт удален');
      }
    } catch (error) {
      this.notifications.error('Ошибка', 'Не удалось удалить рецепт');
    }
  }

  /**
   * Сброс фильтров
   */
  resetFilters() {
    this.store.resetFilters();

    // Сброс полей формы
    this.elements.searchInput.value = '';
    this.elements.categoryFilter.value = '';
    this.elements.difficultyFilter.value = '';
    this.elements.timeFilter.value = '';

    // Сброс query параметров
    this.router.updateQuery({
      search: '',
      category: '',
      difficulty: '',
      maxTime: ''
    }, true);

    this.loadRecipes();
  }

  /**
   * Показать меню сортировки
   */
  showSortMenu() {
    // Можно реализовать всплывающее меню для сортировки
    const sortOptions = [
      { value: 'createdAt', label: 'По дате создания', order: 'desc' },
      { value: 'title', label: 'По названию (А-Я)', order: 'asc' },
      { value: 'time', label: 'По времени приготовления', order: 'asc' },
      { value: 'difficulty', label: 'По сложности', order: 'asc' }
    ];

    // Простая реализация - переключение между двумя вариантами
    const { sortBy, order } = this.store.state.filters;
    let newSortBy = sortBy;
    let newOrder = order;

    if (sortBy === 'createdAt') {
      newSortBy = 'title';
      newOrder = 'asc';
    } else {
      newSortBy = 'createdAt';
      newOrder = 'desc';
    }

    this.store.updateFilters({ sortBy: newSortBy, order: newOrder });
    this.loadRecipes();

    this.notifications.info('Сортировка', 'Сортировка изменена');
  }

  /**
   * Получение текста сложности
   */
  getDifficultyText(difficulty) {
    const map = {
      'easy': 'Легко',
      'medium': 'Средне',
      'hard': 'Сложно',
      'легко': 'Легко',
      'средне': 'Средне',
      'сложно': 'Сложно'
    };
    return map[difficulty] || difficulty || 'Не указано';
  }

  /**
   * Очистка при размонтировании
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Очистка обработчиков событий
    this.elements.searchInput?.removeEventListener('input', () => {});
    this.elements.clearSearch?.removeEventListener('click', () => {});
    this.elements.categoryFilter?.removeEventListener('change', () => {});
    this.elements.difficultyFilter?.removeEventListener('change', () => {});
    this.elements.timeFilter?.removeEventListener('change', () => {});
  }
}
