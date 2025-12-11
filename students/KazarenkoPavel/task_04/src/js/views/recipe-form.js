import { NotificationManager } from '../utils/notifications.js';
import { ModalManager } from '../utils/notifications.js';
import { FormValidator } from '../utils/validation.js';

/**
 * Представление формы рецепта (создание/редактирование)
 */
export class RecipeFormView {
  constructor(store, api, router) {
    this.store = store;
    this.api = api;
    this.router = router;
    this.notifications = new NotificationManager(store);
    this.modals = new ModalManager();
    this.validator = null;
    this.isEditing = false;
    this.currentRecipeId = null;
    this.unsubscribe = null;
  }

  /**
   * Рендеринг представления
   */
  render(params = {}) {
    const recipeId = params.id;
    this.isEditing = !!recipeId;
    this.currentRecipeId = recipeId;

    // Отписываемся от предыдущих обновлений
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Подписываемся на обновления store
    this.unsubscribe = this.store.subscribe((state) => {
      this.onStateChange(state);
    });

    // Если редактирование - загружаем рецепт
    if (this.isEditing && recipeId) {
      this.loadRecipe(recipeId);
    } else {
      // Если создание - сразу рендерим форму
      this.renderForm();
    }
  }

  /**
   * Загрузка рецепта для редактирования
   */
  async loadRecipe(id) {
    try {
      this.store.setLoading(true);
      const recipe = await this.api.getRecipe(id);
      this.store.setCurrentRecipe(recipe);
    } catch (error) {
      this.store.setError(error);
      this.notifications.error('Ошибка', 'Не удалось загрузить рецепт для редактирования');

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

    if (state.loading && this.isEditing) {
      app.innerHTML = this.renderLoading();
    } else if (state.error) {
      app.innerHTML = this.renderError(state.error);
    } else if (this.isEditing && state.currentRecipe) {
      app.innerHTML = this.renderForm(state.currentRecipe);
      this.initForm(state.currentRecipe);
    } else if (!this.isEditing) {
      app.innerHTML = this.renderForm();
      this.initForm();
    }
  }

  /**
   * Рендеринг состояния загрузки
   */
  renderLoading() {
    return `
            <div class="loading-screen">
                <div class="spinner"></div>
                <p>Загрузка рецепта для редактирования...</p>
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
                    ${this.isEditing ? `
                        <button id="retry-load" class="btn btn-primary">
                            <i class="fas fa-redo"></i>
                            Попробовать снова
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
  }

  /**
   * Рендеринг формы
   */
  renderForm(recipe = null) {
    const title = this.isEditing ? 'Редактирование рецепта' : 'Создание нового рецепта';
    const buttonText = this.isEditing ? 'Сохранить изменения' : 'Создать рецепт';

    // Значения по умолчанию
    const defaultRecipe = {
      title: '',
      description: '',
      category: '',
      difficulty: 'легко',
      time: 30,
      servings: 2,
      image: '',
      ingredients: [{ name: '', amount: '' }],
      steps: [''],
      notes: ''
    };

    const data = recipe ? { ...defaultRecipe, ...recipe } : defaultRecipe;

    return `
            <div class="recipe-form-view">
                <div class="breadcrumbs">
                    <ul class="breadcrumbs-list">
                        <li class="breadcrumbs-item">
                            <a href="#/recipes" class="breadcrumbs-link">Все рецепты</a>
                            <span class="breadcrumbs-separator">/</span>
                        </li>
                        <li class="breadcrumbs-item">
                            <span class="breadcrumbs-link active">${title}</span>
                        </li>
                    </ul>
                </div>

                <div class="form-header">
                    <h1 class="page-title">${title}</h1>
                    <p class="form-subtitle">Заполните все необходимые поля для ${this.isEditing ? 'редактирования' : 'создания'} рецепта</p>
                </div>

                <form id="recipe-form" class="recipe-form" novalidate>
                    <div class="form-section">
                        <h2 class="section-title">Основная информация</h2>

                        <div class="form-group">
                            <label for="recipe-title" class="form-label">
                                Название рецепта <span class="required">*</span>
                            </label>
                            <input type="text"
                                   id="recipe-title"
                                   name="title"
                                   class="form-control"
                                   value="${this.escapeHtml(data.title)}"
                                   placeholder="Например: Спагетти Карбонара"
                                   data-validate
                                   required
                                   data-min-length="3"
                                   data-max-length="100">
                            <div class="form-error" id="title-error"></div>
                        </div>

                        <div class="form-group">
                            <label for="recipe-description" class="form-label">
                                Описание <span class="required">*</span>
                            </label>
                            <textarea id="recipe-description"
                                      name="description"
                                      class="form-control form-textarea"
                                      rows="3"
                                      placeholder="Краткое описание рецепта..."
                                      data-validate
                                      required
                                      data-min-length="10">${this.escapeHtml(data.description)}</textarea>
                            <div class="form-error" id="description-error"></div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="recipe-category" class="form-label">Категория</label>
                                <select id="recipe-category" name="category" class="form-control form-select">
                                    <option value="">Выберите категорию</option>
                                    <option value="завтрак" ${data.category === 'завтрак' ? 'selected' : ''}>Завтрак</option>
                                    <option value="обед" ${data.category === 'обед' ? 'selected' : ''}>Обед</option>
                                    <option value="ужин" ${data.category === 'ужин' ? 'selected' : ''}>Ужин</option>
                                    <option value="десерт" ${data.category === 'десерт' ? 'selected' : ''}>Десерт</option>
                                    <option value="вегетарианское" ${data.category === 'вегетарианское' ? 'selected' : ''}>Вегетарианское</option>
                                    <option value="выпечка" ${data.category === 'выпечка' ? 'selected' : ''}>Выпечка</option>
                                    <option value="салаты" ${data.category === 'салаты' ? 'selected' : ''}>Салаты</option>
                                    <option value="супы" ${data.category === 'супы' ? 'selected' : ''}>Супы</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="recipe-difficulty" class="form-label">Сложность</label>
                                <select id="recipe-difficulty" name="difficulty" class="form-control form-select">
                                    <option value="легко" ${data.difficulty === 'легко' ? 'selected' : ''}>Легко</option>
                                    <option value="средне" ${data.difficulty === 'средне' ? 'selected' : ''}>Средне</option>
                                    <option value="сложно" ${data.difficulty === 'сложно' ? 'selected' : ''}>Сложно</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="recipe-time" class="form-label">
                                    Время приготовления (минуты) <span class="required">*</span>
                                </label>
                                <input type="number"
                                       id="recipe-time"
                                       name="time"
                                       class="form-control"
                                       value="${data.time}"
                                       min="1"
                                       max="600"
                                       data-validate
                                       required
                                       data-type="number">
                                <div class="form-error" id="time-error"></div>
                            </div>

                            <div class="form-group">
                                <label for="recipe-servings" class="form-label">Количество порций</label>
                                <input type="number"
                                       id="recipe-servings"
                                       name="servings"
                                       class="form-control"
                                       value="${data.servings}"
                                       min="1"
                                       max="20">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="recipe-image" class="form-label">URL изображения (необязательно)</label>
                            <input type="url"
                                   id="recipe-image"
                                   name="image"
                                   class="form-control"
                                   value="${this.escapeHtml(data.image)}"
                                   placeholder="https://example.com/image.jpg"
                                   data-type="url">
                            <div class="form-error" id="image-error"></div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h2 class="section-title">
                            Ингредиенты <span class="required">*</span>
                            <button type="button" id="add-ingredient" class="btn btn-text btn-small">
                                <i class="fas fa-plus"></i> Добавить
                            </button>
                        </h2>

                        <div id="ingredients-list" class="dynamic-list">
                            ${data.ingredients.map((ing, index) => this.renderIngredientField(ing, index)).join('')}
                        </div>
                        <div class="form-error" id="ingredients-error"></div>
                    </div>

                    <div class="form-section">
                        <h2 class="section-title">
                            Шаги приготовления <span class="required">*</span>
                            <button type="button" id="add-step" class="btn btn-text btn-small">
                                <i class="fas fa-plus"></i> Добавить
                            </button>
                        </h2>

                        <div id="steps-list" class="dynamic-list">
                            ${data.steps.map((step, index) => this.renderStepField(step, index)).join('')}
                        </div>
                        <div class="form-error" id="steps-error"></div>
                    </div>

                    <div class="form-section">
                        <h2 class="section-title">Дополнительно</h2>

                        <div class="form-group">
                            <label for="recipe-notes" class="form-label">Примечания и советы</label>
                            <textarea id="recipe-notes"
                                      name="notes"
                                      class="form-control form-textarea"
                                      rows="3"
                                      placeholder="Дополнительные заметки, советы по сервировке, варианты замены ингредиентов...">${this.escapeHtml(data.notes)}</textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" id="cancel-form" class="btn btn-secondary">
                            <i class="fas fa-times"></i>
                            Отмена
                        </button>
                        <button type="submit" id="submit-form" class="btn btn-primary">
                            <i class="fas ${this.isEditing ? 'fa-save' : 'fa-plus'}"></i>
                            ${buttonText}
                        </button>
                    </div>
                </form>
            </div>
        `;
  }

  /**
   * Рендеринг поля ингредиента
   */
  renderIngredientField(ingredient = { name: '', amount: '' }, index) {
    return `
            <div class="dynamic-item" data-index="${index}">
                <div class="form-row">
                    <div class="form-group" style="flex: 2;">
                        <input type="text"
                               name="ingredients[${index}][name]"
                               class="form-control"
                               value="${this.escapeHtml(ingredient.name)}"
                               placeholder="Название ингредиента"
                               data-validate
                               required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <input type="text"
                               name="ingredients[${index}][amount]"
                               class="form-control"
                               value="${this.escapeHtml(ingredient.amount)}"
                               placeholder="Количество"
                               data-validate
                               required>
                    </div>
                    <div class="form-group" style="width: 40px;">
                        <button type="button" class="btn btn-text btn-remove-item" title="Удалить">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Рендеринг поля шага приготовления
   */
  renderStepField(step = '', index) {
    return `
            <div class="dynamic-item" data-index="${index}">
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <textarea name="steps[${index}]"
                                  class="form-control"
                                  rows="2"
                                  placeholder="Опишите шаг приготовления..."
                                  data-validate
                                  required>${this.escapeHtml(step)}</textarea>
                    </div>
                    <div class="form-group" style="width: 40px;">
                        <button type="button" class="btn btn-text btn-remove-item" title="Удалить">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Инициализация формы
   */
  initForm(recipe = null) {
    // Инициализация валидатора
    this.validator = new FormValidator('recipe-form');

    // Обработка отправки формы
    const form = document.getElementById('recipe-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Отмена формы
    document.getElementById('cancel-form').addEventListener('click', () => {
      if (this.isEditing && recipe) {
        this.router.navigate(`/recipes/${recipe.id}`);
      } else {
        this.router.navigate('/recipes');
      }
    });

    // Добавление ингредиента
    document.getElementById('add-ingredient').addEventListener('click', () => {
      this.addIngredientField();
    });

    // Добавление шага
    document.getElementById('add-step').addEventListener('click', () => {
      this.addStepField();
    });

    // Удаление динамических элементов
    document.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.dynamic-item');
        this.removeDynamicItem(item);
      });
    });

    // Заблокировать кнопку отправки при загрузке
    this.store.subscribe((state) => {
      const submitBtn = document.getElementById('submit-form');
      if (submitBtn) {
        submitBtn.disabled = state.loading;
        submitBtn.innerHTML = state.loading ?
          `<i class="fas fa-spinner fa-spin"></i> ${this.isEditing ? 'Сохранение...' : 'Создание...'}` :
          `<i class="fas ${this.isEditing ? 'fa-save' : 'fa-plus'}"></i> ${this.isEditing ? 'Сохранить изменения' : 'Создать рецепт'}`;
      }
    });

    // Обработчики ошибок
    document.getElementById('go-back')?.addEventListener('click', () => {
      this.router.navigate('/recipes');
    });

    document.getElementById('retry-load')?.addEventListener('click', () => {
      this.loadRecipe(this.currentRecipeId);
    });
  }

  /**
   * Обработка отправки формы
   */
  async handleSubmit() {
    // Валидация формы
    if (!this.validator.validate()) {
      this.validator.showErrors();
      return;
    }

    // Сбор данных формы
    const formData = this.collectFormData();

    // Дополнительная валидация
    const validation = FormValidator.validateRecipe(formData);
    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      return;
    }

    try {
      this.store.setLoading(true);

      if (this.isEditing) {
        // Обновление рецепта
        await this.api.updateRecipe(this.currentRecipeId, formData);
        this.notifications.success('Успешно', 'Рецепт обновлен');
        this.router.navigate(`/recipes/${this.currentRecipeId}`);
      } else {
        // Создание рецепта
        const newRecipe = await this.api.createRecipe(formData);
        this.notifications.success('Успешно', 'Рецепт создан');
        this.router.navigate(`/recipes/${newRecipe.id}`);
      }
    } catch (error) {
      this.store.setError(error);
      this.notifications.error('Ошибка',
        this.isEditing ? 'Не удалось обновить рецепт' : 'Не удалось создать рецепт');
    }
  }

  /**
   * Сбор данных из формы
   */
  collectFormData() {
    const form = document.getElementById('recipe-form');
    const formData = new FormData(form);

    // Базовые поля
    const data = {
      title: formData.get('title')?.trim() || '',
      description: formData.get('description')?.trim() || '',
      category: formData.get('category') || '',
      difficulty: formData.get('difficulty') || 'легко',
      time: parseInt(formData.get('time')) || 30,
      servings: parseInt(formData.get('servings')) || 2,
      image: formData.get('image')?.trim() || '',
      notes: formData.get('notes')?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Сбор ингредиентов
    const ingredients = [];
    const ingredientNames = formData.getAll('ingredients[][name]');
    const ingredientAmounts = formData.getAll('ingredients[][amount]');

    for (let i = 0; i < ingredientNames.length; i++) {
      const name = ingredientNames[i]?.trim();
      const amount = ingredientAmounts[i]?.trim();

      if (name && amount) {
        ingredients.push({ name, amount });
      }
    }

    data.ingredients = ingredients;

    // Сбор шагов приготовления
    const steps = formData.getAll('steps[]')
      .map(step => step?.trim())
      .filter(step => step);

    data.steps = steps;

    return data;
  }

  /**
   * Добавление поля ингредиента
   */
  addIngredientField() {
    const list = document.getElementById('ingredients-list');
    const index = list.children.length;

    const field = this.renderIngredientField({}, index);
    list.insertAdjacentHTML('beforeend', field);

    // Добавить обработчик удаления для нового поля
    const newItem = list.lastElementChild;
    const removeBtn = newItem.querySelector('.btn-remove-item');
    removeBtn.addEventListener('click', (e) => {
      const item = e.target.closest('.dynamic-item');
      this.removeDynamicItem(item);
    });
  }

  /**
   * Добавление поля шага
   */
  addStepField() {
    const list = document.getElementById('steps-list');
    const index = list.children.length;

    const field = this.renderStepField('', index);
    list.insertAdjacentHTML('beforeend', field);

    // Добавить обработчик удаления для нового поля
    const newItem = list.lastElementChild;
    const removeBtn = newItem.querySelector('.btn-remove-item');
    removeBtn.addEventListener('click', (e) => {
      const item = e.target.closest('.dynamic-item');
      this.removeDynamicItem(item);
    });
  }

  /**
   * Удаление динамического элемента
   */
  removeDynamicItem(item) {
    if (item.parentElement.children.length > 1) {
      item.remove();
      this.renumberDynamicItems();
    } else {
      // Нельзя удалить последний элемент
      this.notifications.warning('Внимание', 'Должен остаться хотя бы один элемент');
    }
  }

  /**
   * Перенумерация динамических элементов
   */
  renumberDynamicItems() {
    // Перенумеровать ингредиенты
    const ingredientItems = document.querySelectorAll('#ingredients-list .dynamic-item');
    ingredientItems.forEach((item, index) => {
      item.dataset.index = index;
      const inputs = item.querySelectorAll('input');
      inputs[0].name = `ingredients[${index}][name]`;
      inputs[1].name = `ingredients[${index}][amount]`;
    });

    // Перенумеровать шаги
    const stepItems = document.querySelectorAll('#steps-list .dynamic-item');
    stepItems.forEach((item, index) => {
      item.dataset.index = index;
      const textarea = item.querySelector('textarea');
      textarea.name = `steps[${index}]`;
    });
  }

  /**
   * Показать ошибки валидации
   */
  showValidationErrors(errors) {
    // Очистить предыдущие ошибки
    this.validator.clearErrors();

    // Показать новые ошибки
    Object.keys(errors).forEach(field => {
      const errorElement = document.getElementById(`${field}-error`);
      if (errorElement) {
        errorElement.textContent = errors[field];
        errorElement.classList.add('show');

        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
          input.classList.add('error');
          input.focus();
        }
      }
    });

    // Общие ошибки для ингредиентов и шагов
    if (errors.ingredients) {
      const errorElement = document.getElementById('ingredients-error');
      if (errorElement) {
        errorElement.textContent = errors.ingredients;
        errorElement.classList.add('show');
      }
    }

    if (errors.steps) {
      const errorElement = document.getElementById('steps-error');
      if (errorElement) {
        errorElement.textContent = errors.steps;
        errorElement.classList.add('show');
      }
    }
  }

  /**
   * Экранирование HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
