// ================================
// Функции валидации для юнит-тестов
// ================================

// Создаем глобальный объект для тестов
window.Validation = {
  /**
   * Валидация email
   */
  validateEmail: function(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Валидация сообщения (мин. 20 символов)
   */
  validateMessage: function(message) {
    if (!message || typeof message !== 'string') return false;
    return message.trim().length >= 20;
  },

  /**
   * Валидация имени (не пустое)
   */
  validateName: function(name) {
    return name && typeof name === 'string' && name.trim().length > 0;
  },

  /**
   * Валидация URL (опционально)
   */
  validateURL: function(url) {
    if (!url || url.trim() === '') return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Полная валидация формы
   */
  validateForm: function(formData) {
    const errors = {};
    
    if (!this.validateName(formData.name)) {
      errors.name = 'Имя обязательно для заполнения';
    }
    
    if (!this.validateEmail(formData.email)) {
      errors.email = 'Введите корректный email адрес';
    }
    
    if (!this.validateMessage(formData.message)) {
      errors.message = 'Сообщение должно содержать минимум 20 символов';
    }
    
    if (!this.validateURL(formData.url)) {
      errors.url = 'Введите корректный URL';
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    return { isValid, errors };
  },

  /**
   * Функция для работы с лайками
   */
  toggleLike: function(currentState, currentLikes) {
    const newState = !currentState;
    const newLikes = newState ? currentLikes + 1 : currentLikes - 1;
    
    return {
      liked: newState,
      likes: newLikes
    };
  }
};