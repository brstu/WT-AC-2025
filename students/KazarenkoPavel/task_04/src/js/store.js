/**
 * Централизованное хранилище состояния приложения
 */
export class Store {
  constructor() {
    this.state = {
      recipes: [],
      currentRecipe: null,
      loading: false,
      error: null,
      filters: {
        search: '',
        category: '',
        difficulty: '',
        maxTime: '',
        sortBy: 'createdAt',
        order: 'desc'
      },
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1
      },
      notifications: []
    };

    this.listeners = new Set();
  }

  /**
   * Подписка на изменения состояния
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Уведомление подписчиков об изменении состояния
   */
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Обновление состояния
   */
  setState(updater) {
    if (typeof updater === 'function') {
      this.state = updater(this.state);
    } else {
      this.state = { ...this.state, ...updater };
    }
    this.notify();
  }

  /**
   * Установка состояния загрузки
   */
  setLoading(loading) {
    this.setState(state => ({
      ...state,
      loading
    }));
  }

  /**
   * Установка ошибки
   */
  setError(error) {
    this.setState(state => ({
      ...state,
      error,
      loading: false
    }));
  }

  /**
   * Очистка ошибки
   */
  clearError() {
    this.setState(state => ({
      ...state,
      error: null
    }));
  }

  /**
   * Установка списка рецептов
   */
  setRecipes(recipes) {
    this.setState(state => ({
      ...state,
      recipes,
      loading: false,
      error: null
    }));
  }

  /**
   * Установка текущего рецепта
   */
  setCurrentRecipe(recipe) {
    this.setState(state => ({
      ...state,
      currentRecipe: recipe,
      loading: false,
      error: null
    }));
  }

  /**
   * Обновление фильтров
   */
  updateFilters(filters) {
    this.setState(state => ({
      ...state,
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }
    }));
  }

  /**
   * Сброс фильтров
   */
  resetFilters() {
    this.setState(state => ({
      ...state,
      filters: {
        search: '',
        category: '',
        difficulty: '',
        maxTime: '',
        sortBy: 'createdAt',
        order: 'desc'
      },
      pagination: { ...state.pagination, page: 1 }
    }));
  }

  /**
   * Обновление пагинации
   */
  updatePagination(pagination) {
    this.setState(state => ({
      ...state,
      pagination: { ...state.pagination, ...pagination }
    }));
  }

  /**
   * Добавление уведомления
   */
  addNotification(notification) {
    const id = Date.now();
    const newNotification = { ...notification, id };

    this.setState(state => ({
      ...state,
      notifications: [...state.notifications, newNotification]
    }));

    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
      this.removeNotification(id);
    }, 5000);
  }

  /**
   * Удаление уведомления
   */
  removeNotification(id) {
    this.setState(state => ({
      ...state,
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  }

  /**
   * Получение текущих фильтров для API
   */
  getApiFilters() {
    const { filters } = this.state;
    const apiFilters = {};

    if (filters.search) apiFilters.search = filters.search;
    if (filters.category) apiFilters.category = filters.category;
    if (filters.difficulty) apiFilters.difficulty = filters.difficulty;
    if (filters.maxTime) apiFilters.maxTime = filters.maxTime;
    if (filters.sortBy) apiFilters.sortBy = filters.sortBy;
    if (filters.order) apiFilters.order = filters.order;

    return apiFilters;
  }

  /**
   * Геттер для отфильтрованных рецептов (клиентская фильтрация, если нужно)
   */
  get filteredRecipes() {
    const { recipes, filters } = this.state;

    return recipes.filter(recipe => {
      // Поиск по названию и описанию
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const inTitle = recipe.title.toLowerCase().includes(searchLower);
        const inDescription = recipe.description.toLowerCase().includes(searchLower);
        const inIngredients = recipe.ingredients?.some(ing =>
          ing.name.toLowerCase().includes(searchLower)
        );
        if (!inTitle && !inDescription && !inIngredients) return false;
      }

      // Фильтр по категории
      if (filters.category && recipe.category !== filters.category) {
        return false;
      }

      // Фильтр по сложности
      if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
        return false;
      }

      // Фильтр по времени
      if (filters.maxTime && recipe.time > parseInt(filters.maxTime)) {
        return false;
      }

      return true;
    });
  }
}
