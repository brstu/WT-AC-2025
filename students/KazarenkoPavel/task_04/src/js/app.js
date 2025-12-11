import { Router } from './router.js';
import { RecipesAPI } from './api.js';
import { Store } from './store.js';
import { LayoutManager } from './views/layout.js';
import { RecipesListView } from './views/recipes-list.js';
import { RecipeDetailView } from './views/recipe-detail.js';
import { RecipeFormView } from './views/recipe-form.js';

/**
 * Основной класс приложения
 */
class RecipesApp {
  constructor() {
    // Инициализация компонентов
    this.store = new Store();
    this.api = new RecipesAPI('https://my-json-server.typicode.com/catsker/recipes-api-lab4');
    this.router = new Router();
    this.layout = new LayoutManager(this.store, this.api);

    // Инициализация представлений
    this.views = {
      recipesList: new RecipesListView(this.store, this.api, this.router),
      recipeDetail: new RecipeDetailView(this.store, this.api, this.router),
      recipeForm: new RecipeFormView(this.store, this.api, this.router)
    };
  }

  /**
   * Инициализация приложения
   */
  async init() {
    console.log('🍳 Инициализация приложения "Кулинарная книга"');

    try {
      // Настройка роутера
      this.setupRouter();

      // Инициализация layout
      this.layout.init();

      // Загрузка начальных данных
      await this.loadInitialData();

      console.log('✅ Приложение успешно инициализировано');

    } catch (error) {
      console.error('❌ Ошибка инициализации приложения:', error);
      this.showFatalError(error);
    }
  }

  /**
   * Настройка маршрутов
   */
  setupRouter() {
    // Главная страница - редирект на список рецептов
    this.router.addRoute('/', this.views.recipesList, 'Все рецепты');

    // Список рецептов
    this.router.addRoute('/recipes', this.views.recipesList, 'Все рецепты');

    // Детали рецепта
    this.router.addRoute('/recipes/:id', this.views.recipeDetail, 'Рецепт');

    // Создание рецепта
    this.router.addRoute('/recipes/new', this.views.recipeForm, 'Новый рецепт');

    // Редактирование рецепта
    this.router.addRoute('/recipes/:id/edit', this.views.recipeForm, 'Редактирование');

    // Обработка 404
    this.router.addRoute('/404', this.views.recipesList);

    console.log('✅ Роутер настроен');
  }

  /**
   * Загрузка начальных данных
   */
  async loadInitialData() {
    // Можно загрузить начальные данные, если нужно
    // Например, проверка авторизации, загрузка категорий и т.д.

    // Показать начальную загрузку
    this.layout.setLoading(true);

    try {
      // Загрузка статистики
      await this.layout.loadStats();

      // Если есть токен авторизации, проверяем его
      const token = localStorage.getItem('recipes_token');
      if (token) {
        this.api.setToken(token);
        // Можно проверить валидность токена
      }

    } finally {
      // Скрыть loading screen
      this.layout.setLoading(false);
    }
  }

  /**
   * Показать фатальную ошибку
   */
  showFatalError(error) {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
                <div class="error-state fatal-error">
                    <h2>😱 Критическая ошибка</h2>
                    <p>Приложение не может быть загружено. Пожалуйста, обновите страницу.</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        <i class="fas fa-redo"></i>
                        Обновить страницу
                    </button>
                </div>
            `;
    }
  }
}

// Запуск приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new RecipesApp();
  app.init();

  // Экспорт для отладки
  window.app = app;
});
