/**
 * Утилиты для валидации форм
 * @module utils/validation
 */

/**
 * Валидирует поле формы и отображает сообщение об ошибке
 * @param {HTMLInputElement|HTMLTextAreaElement} field - Поле для валидации
 * @returns {boolean} true, если поле валидно
 */
export function validateField(field) {
  const err = field.parentElement.querySelector('.error');
  if (!field.checkValidity()) {
    if (field.validity.valueMissing) {
      err.textContent = 'Поле обязательно';
    } else if (field.validity.typeMismatch) {
      err.textContent = 'Неверный формат';
    } else if (field.validity.tooShort) {
      err.textContent = `Минимум ${field.getAttribute('minlength')} символов`;
    } else {
      err.textContent = 'Неверное значение';
    }
    return false;
  }
  err.textContent = '';
  return true;
}

/**
 * Форматирует дату для отображения
 * @param {number|Date} d - Дата для форматирования
 * @returns {string} Отформатированная дата
 */
export function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
