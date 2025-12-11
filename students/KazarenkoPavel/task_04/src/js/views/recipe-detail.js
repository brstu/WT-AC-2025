import { NotificationManager } from '../utils/notifications.js';
import { ModalManager } from '../utils/notifications.js';

/**
 * Представление деталей рецепта
 */
export class RecipeDetailView {
  constructor(store, api, router) {
    this.store = store;
    this.api = api;
    this.router = router;
    this.notifications = new NotificationManager(store);
    this.modals = new ModalManager();
    this.unsubscribe = null;
  }

  /**
   * Рендеринг представления
   */
  render(params = {}) {
    const recipeId = params.id;

    if (!recipeId) {
      this.router.navigate('/recipes');
      return;
    }

    // Отписываемся от предыдущих обновлений
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Подписываемся на обновления store
    this.unsubscribe = this.store.subscribe((state) => {
      this.onStateChange(state);
    });

    // Загрузка рецепта
    this.loadRecipe(recipeId);
  }

  /**
   * Загрузка рецепта
   */
  async loadRecipe(id) {
    try {
      this.store.setLoading(true);
      const recipe = await this.api.getRecipe(id);
      this.store.setCurrentRecipe(recipe);
    } catch (error) {
      this.store.setError(error);
      this.notifications.error('Ошибка', 'Не удалось загрузить рецепт');

      // Если рецепт не найден, возвращаемся к списку
      if (error.message.includes('404')) {
        setTimeout(() => this.router.navigate('/recipes'), 2000);
      }
    }
  }

  /**
   * Обработчик изменения состояния
   */
  onStateChange(state) {
    const app = document.getElementById('app');

    if (state.loading) {
      app.innerHTML = this.renderLoading();
    } else if (state.error) {
      app.innerHTML = this.renderError(state.error);
    } else if (state.currentRecipe) {
      app.innerHTML = this.renderRecipe(state.currentRecipe);
      this.initEvents(state.currentRecipe);
    }
  }

  /**
   * Рендеринг состояния загрузки
   */
  renderLoading() {
    return `
            <div class="loading-screen">
                <div class="spinner"></div>
                <p>Загрузка рецепта...</p>
            </div>
        `;
  }

  /**
   * Рендеринг ошибки
   */
  renderError(error) {
    return `
            <div class="error-state">
                <h2>😕 Ошибка загрузки</h2>
                <p>${error.message || 'Произошла ошибка при загрузке рецепта'}</p>
                <div class="error-actions">
                    <button id="go-back" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        Назад к списку
                    </button>
                    <button id="retry-detail" class="btn btn-primary">
                        <i class="fas fa-redo"></i>
                        Попробовать снова
                    </button>
                </div>
            </div>
        `;
  }

  /**
   * Рендеринг рецепта
   */
  renderRecipe(recipe) {
    return `
            <div class="recipe-detail-view">
                <div class="breadcrumbs">
                    <ul class="breadcrumbs-list">
                        <li class="breadcrumbs-item">
                            <a href="#/recipes" class="breadcrumbs-link">Все рецепты</a>
                            <span class="breadcrumbs-separator">/</span>
                        </li>
                        <li class="breadcrumbs-item">
                            <span class="breadcrumbs-link active">${recipe.title}</span>
                        </li>
                    </ul>
                </div>

                <div class="recipe-detail-header">
                    <div class="recipe-detail-image">
                        ${recipe.image ?
      `<img src="${recipe.image}" alt="${recipe.title}">` :
      `<i class="fas fa-utensils"></i>`
    }
                    </div>

                    <div class="recipe-detail-info">
                        <h1>${recipe.title}</h1>

                        <div class="recipe-meta-large">
                            <div class="recipe-tag category">${recipe.category || 'Без категории'}</div>
                            <div class="recipe-tag ${this.getDifficultyClass(recipe.difficulty)}">
                                ${this.getDifficultyText(recipe.difficulty)}
                            </div>
                            <div class="recipe-tag">
                                <i class="fas fa-clock"></i> ${recipe.time || '?'} минут
                            </div>
                            <div class="recipe-tag">
                                <i class="fas fa-user-friends"></i> ${recipe.servings || '?'} порций
                            </div>
                        </div>

                        <p class="recipe-description-full">${recipe.description}</p>

                        <div class="recipe-actions-bar">
                            <a href="#/recipes/${recipe.id}/edit" class="btn btn-primary">
                                <i class="fas fa-edit"></i>
                                Редактировать
                            </a>
                            <button id="delete-recipe" class="btn btn-danger">
                                <i class="fas fa-trash"></i>
                                Удалить
                            </button>
                            <button id="share-recipe" class="btn btn-secondary">
                                <i class="fas fa-share-alt"></i>
                                Поделиться
                            </button>
                        </div>
                    </div>
                </div>

                <div class="recipe-sections">
                    <div class="section">
                        <h2 class="section-title">
                            <i class="fas fa-shopping-basket"></i>
                            Ингредиенты
                        </h2>
                        <ul class="ingredients-list">
                            ${recipe.ingredients?.map(ing => `
                                <li>
                                    <span class="ingredient-name">${ing.name}</span>
                                    <span class="ingredient-amount">${ing.amount}</span>
                                </li>
                            `).join('') || '<p>Ингредиенты не указаны</p>'}
                        </ul>
                    </div>

                    <div class="section">
                        <h2 class="section-title">
                            <i class="fas fa-list-ol"></i>
                            Способ приготовления
                        </h2>
                        <ol class="steps-list">
                            ${recipe.steps?.map(step => `
                                <li>${step}</li>
                            `).join('') || '<p>Шаги приготовления не указаны</p>'}
                        </ol>
                    </div>
                </div>

                ${recipe.notes ? `
                    <div class="recipe-notes">
                        <h2 class="section-title">
                            <i class="fas fa-sticky-note"></i>
                            Примечания
                        </h2>
                        <p>${recipe.notes}</p>
                    </div>
                ` : ''}

                <div class="recipe-footer">
                    <div class="recipe-meta-footer">
                        <span><i class="fas fa-calendar"></i> Создан: ${this.formatDate(recipe.createdAt)}</span>
                        ${recipe.updatedAt && recipe.updatedAt !== recipe.createdAt ?
      `<span><i class="fas fa-history"></i> Обновлен: ${this.formatDate(recipe.updatedAt)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Инициализация событий
   */
  initEvents(recipe) {
    // Удаление рецепта
    document.getElementById('delete-recipe')?.addEventListener('click', async () => {
      await this.deleteRecipe(recipe.id);
    });

    // Назад к списку
    document.getElementById('go-back')?.addEventListener('click', () => {
      this.router.navigate('/recipes');
    });

    // Повторная попытка загрузки
    document.getElementById('retry-detail')?.addEventListener('click', () => {
      this.loadRecipe(recipe.id);
    });

    // Поделиться рецептом
    document.getElementById('share-recipe')?.addEventListener('click', () => {
      this.shareRecipe(recipe);
    });
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
        this.notifications.success('Успешно', 'Рецепт удален');

        // Возвращаемся к списку через 1 секунду
        setTimeout(() => {
          this.router.navigate('/recipes');
        }, 1000);
      }
    } catch (error) {
      this.notifications.error('Ошибка', 'Не удалось удалить рецепт');
    }
  }

  /**
   * Поделиться рецептом
   */
  shareRecipe(recipe) {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description.substring(0, 100),
        url: window.location.href
      }).catch(() => {
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }

  /**
   * Копирование ссылки в буфер обмена
   */
  copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.notifications.success('Скопировано', 'Ссылка скопирована в буфер обмена');
    }).catch(() => {
      this.notifications.error('Ошибка', 'Не удалось скопировать ссылку');
    });
  }

  /**
   * Получение CSS класса для сложности
   */
  getDifficultyClass(difficulty) {
    const map = {
      'easy': 'difficulty-easy',
      'легко': 'difficulty-easy',
      'medium': 'difficulty-medium',
      'средне': 'difficulty-medium',
      'hard': 'difficulty-hard',
      'сложно': 'difficulty-hard'
    };
    return map[difficulty] || '';
  }

  /**
   * Получение текста сложности
   */
  getDifficultyText(difficulty) {
    const map = {
      'easy': 'Легко',
      'легко': 'Легко',
      'medium': 'Средне',
      'средне': 'Средне',
      'hard': 'Сложно',
      'сложно': 'Сложно'
    };
    return map[difficulty] || difficulty || 'Не указано';
  }

  /**
   * Форматирование даты
   */
  formatDate(dateString) {
    if (!dateString) return 'Неизвестно';

    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Очистка при размонтировании
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.store.setCurrentRecipe(null);
  }
}
