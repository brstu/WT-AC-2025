/**
 * Утилиты для валидации форм
 */
export class FormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.errors = new Map();
    this.init();
  }

  /**
   * Инициализация валидатора
   */
  init() {
    this.form?.addEventListener('submit', (e) => {
      if (!this.validate()) {
        e.preventDefault();
        this.showErrors();
      }
    });

    // Валидация при изменении полей
    this.form?.addEventListener('input', (e) => {
      if (e.target.hasAttribute('data-validate')) {
        this.validateField(e.target);
        this.showFieldError(e.target);
      }
    });

    // Валидация при потере фокуса
    this.form?.addEventListener('blur', (e) => {
      if (e.target.hasAttribute('data-validate')) {
        this.validateField(e.target);
        this.showFieldError(e.target);
      }
    }, true);
  }

  /**
   * Добавление правила валидации
   */
  addRule(fieldName, rule) {
    if (!this.rules) this.rules = new Map();
    if (!this.rules.has(fieldName)) {
      this.rules.set(fieldName, []);
    }
    this.rules.get(fieldName).push(rule);
  }

  /**
   * Валидация всего формы
   */
  validate() {
    this.errors.clear();

    const fields = this.form.querySelectorAll('[data-validate]');
    let isValid = true;

    fields.forEach(field => {
      const fieldErrors = this.validateField(field);
      if (fieldErrors.length > 0) {
        this.errors.set(field.name || field.id, fieldErrors);
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Валидация отдельного поля
   */
  validateField(field) {
    const value = field.value.trim();
    const errors = [];

    // Проверка обязательных полей
    if (field.required && !value) {
      errors.push('Это поле обязательно для заполнения');
      return errors;
    }

    if (!value && !field.required) {
      return errors; // Необязательное пустое поле - OK
    }

    // Проверка минимальной длины
    const minLength = field.dataset.minLength;
    if (minLength && value.length < parseInt(minLength)) {
      errors.push(`Минимальная длина: ${minLength} символов`);
    }

    // Проверка максимальной длины
    const maxLength = field.dataset.maxLength;
    if (maxLength && value.length > parseInt(maxLength)) {
      errors.push(`Максимальная длина: ${maxLength} символов`);
    }

    // Проверка паттерна
    const pattern = field.dataset.pattern;
    if (pattern && !new RegExp(pattern).test(value)) {
      const patternMessage = field.dataset.patternMessage || 'Некорректный формат';
      errors.push(patternMessage);
    }

    // Проверка email
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push('Введите корректный email');
      }
    }

    // Проверка числа
    if (field.dataset.type === 'number' && value) {
      const num = parseInt(value);
      if (isNaN(num)) {
        errors.push('Введите число');
      } else {
        const min = field.dataset.min;
        const max = field.dataset.max;
        if (min && num < parseInt(min)) {
          errors.push(`Минимальное значение: ${min}`);
        }
        if (max && num > parseInt(max)) {
          errors.push(`Максимальное значение: ${max}`);
        }
      }
    }

    // Проверка URL
    if (field.dataset.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        errors.push('Введите корректный URL');
      }
    }

    return errors;
  }

  /**
   * Показать ошибки для поля
   */
  showFieldError(field) {
    const errorContainer = field.closest('.form-group')?.querySelector('.form-error');
    if (!errorContainer) return;

    const errors = this.validateField(field);

    if (errors.length > 0) {
      errorContainer.textContent = errors[0];
      errorContainer.classList.add('show');
      field.classList.add('error');
    } else {
      errorContainer.classList.remove('show');
      field.classList.remove('error');
    }
  }

  /**
   * Показать все ошибки формы
   */
  showErrors() {
    // Очищаем все предыдущие ошибки
    this.form.querySelectorAll('.form-error').forEach(el => {
      el.classList.remove('show');
    });

    this.form.querySelectorAll('.form-control').forEach(el => {
      el.classList.remove('error');
    });

    // Показываем новые ошибки
    this.errors.forEach((errors, fieldName) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`) ||
        this.form.querySelector(`#${fieldName}`);
      const errorContainer = field?.closest('.form-group')?.querySelector('.form-error');

      if (field && errorContainer && errors.length > 0) {
        errorContainer.textContent = errors[0];
        errorContainer.classList.add('show');
        field.classList.add('error');
        field.focus();
      }
    });
  }

  /**
   * Очистка ошибок
   */
  clearErrors() {
    this.errors.clear();
    this.form.querySelectorAll('.form-error').forEach(el => {
      el.classList.remove('show');
    });
    this.form.querySelectorAll('.form-control').forEach(el => {
      el.classList.remove('error');
    });
  }

  /**
   * Валидация данных рецепта
   */
  static validateRecipe(data) {
    const errors = {};

    // Проверка названия
    if (!data.title || data.title.trim().length < 3) {
      errors.title = 'Название должно содержать минимум 3 символа';
    } else if (data.title.length > 100) {
      errors.title = 'Название не должно превышать 100 символов';
    }

    // Проверка описания
    if (!data.description || data.description.trim().length < 10) {
      errors.description = 'Описание должно содержать минимум 10 символов';
    }

    // Проверка времени приготовления
    if (!data.time || data.time < 1 || data.time > 600) {
      errors.time = 'Время приготовления должно быть от 1 до 600 минут';
    }

    // Проверка ингредиентов
    if (!data.ingredients || !Array.isArray(data.ingredients) || data.ingredients.length === 0) {
      errors.ingredients = 'Добавьте хотя бы один ингредиент';
    } else {
      data.ingredients.forEach((ing, index) => {
        if (!ing.name || ing.name.trim().length === 0) {
          errors[`ingredient-${index}`] = 'Укажите название ингредиента';
        }
        if (!ing.amount || ing.amount.trim().length === 0) {
          errors[`ingredient-${index}-amount`] = 'Укажите количество';
        }
      });
    }

    // Проверка шагов приготовления
    if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
      errors.steps = 'Добавьте хотя бы один шаг приготовления';
    } else {
      data.steps.forEach((step, index) => {
        if (!step || step.trim().length < 5) {
          errors[`step-${index}`] = 'Шаг должен содержать минимум 5 символов';
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Парсинг ингредиентов из текста
   */
  static parseIngredients(text) {
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split('-').map(p => p.trim());
        return {
          name: parts[0] || '',
          amount: parts[1] || ''
        };
      });
  }

  /**
   * Парсинг шагов из текста
   */
  static parseSteps(text) {
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
}
