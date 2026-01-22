/**
 * API клиент для работы с рецептами
 */
export class RecipesAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.abortController = null;
    this.token = localStorage.getItem('recipes_token') || null;
  }

  /**
   * Установка токена авторизации
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('recipes_token', token);
    } else {
      localStorage.removeItem('recipes_token');
    }
  }

  /**
   * Общий метод для выполнения запросов
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    this.abortController = new AbortController();

    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: this.abortController.signal,
      ...options
    };

    // Добавляем токен авторизации если есть
    if (this.token) {
      defaultOptions.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, defaultOptions);

      // Обработка ошибок HTTP
      if (!response.ok) {
        const error = await this.handleError(response);
        throw error;
      }

      // Для DELETE запросов может не быть тела
      if (options.method === 'DELETE' && response.status === 204) {
        return null;
      }

      return await response.json();

    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * Обработка ошибок HTTP
   */
  async handleError(response) {
    let message = `HTTP ${response.status}`;
    let details = '';

    try {
      const errorData = await response.json();
      details = errorData.message || JSON.stringify(errorData);
    } catch {
      details = response.statusText;
    }

    // Специальные сообщения для разных статусов
    switch (response.status) {
      case 400:
        message = 'Некорректный запрос';
        break;
      case 401:
        message = 'Требуется авторизация';
        // Можно перенаправить на страницу входа
        break;
      case 403:
        message = 'Доступ запрещен';
        break;
      case 404:
        message = 'Ресурс не найден';
        break;
      case 422:
        message = 'Ошибка валидации данных';
        break;
      case 500:
        message = 'Ошибка сервера';
        break;
    }

    return new Error(`${message}: ${details}`);
  }

  /**
   * Отмена текущего запроса
   */
  cancelRequest() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Получение списка рецептов с пагинацией и фильтрацией
   */
  async getRecipes(params = {}) {
    const queryParams = new URLSearchParams();

    // Добавляем параметры пагинации
    if (params.page) queryParams.append('_page', params.page);
    if (params.limit) queryParams.append('_limit', params.limit);

    // Добавляем параметры сортировки
    if (params.sortBy) queryParams.append('_sort', params.sortBy);
    if (params.order) queryParams.append('_order', params.order);

    // Добавляем фильтры
    if (params.category) queryParams.append('category', params.category);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.maxTime) queryParams.append('time_lte', params.maxTime);
    if (params.search) queryParams.append('q', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/recipes?${queryString}` : '/recipes';

    return this.request(endpoint);
  }

  /**
   * Получение рецепта по ID
   */
  async getRecipe(id) {
    return this.request(`/recipes/${id}`);
  }

  /**
   * Создание нового рецепта
   */
  async createRecipe(recipeData) {
    return this.request('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData)
    });
  }

  /**
   * Обновление рецепта
   */
  async updateRecipe(id, recipeData) {
    return this.request(`/recipes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(recipeData)
    });
  }

  /**
   * Удаление рецепта
   */
  async deleteRecipe(id) {
    return this.request(`/recipes/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Получение статистики
   */
  async getStats() {
    const [recipes] = await Promise.all([
      this.request('/recipes')
    ]);

    const totalTime = recipes.reduce((sum, recipe) => sum + (recipe.time || 0), 0);

    return {
      total: recipes.length,
      totalTime,
      categories: this.countCategories(recipes),
      difficulties: this.countDifficulties(recipes)
    };
  }

  /**
   * Подсчет рецептов по категориям
   */
  countCategories(recipes) {
    return recipes.reduce((acc, recipe) => {
      const category = recipe.category || 'без категории';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Подсчет рецептов по сложности
   */
  countDifficulties(recipes) {
    return recipes.reduce((acc, recipe) => {
      const difficulty = recipe.difficulty || 'не указана';
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {});
  }
}
