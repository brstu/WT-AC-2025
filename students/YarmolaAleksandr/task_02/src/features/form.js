/**
 * Функциональность формы вопросов
 * @module features/form
 */

import { validateField, formatDate } from '../utils/validation.js';
import { addQuestion } from './questions.js';

/**
 * Инициализирует форму с валидацией
 */
export function initForm() {
  const form = document.getElementById('question-form');
  const submitBtn = document.getElementById('submit-btn');
  const fields = Array.from(form.querySelectorAll('input, textarea'));

  // Изначально кнопка отправки неактивна
  submitBtn.disabled = true;

  // Валидация при вводе
  fields.forEach(field => {
    field.addEventListener('input', () => {
      validateField(field);
      // Активируем кнопку только если все поля валидны
      submitBtn.disabled = !fields.every(f => validateField(f));
    });
  });

  // Обработка отправки формы
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Повторная валидация всех полей
    const isValid = fields.map(validateField).every(Boolean);
    if (!isValid) return;

    // Получение данных формы
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Создание объекта вопроса
    const question = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      question: data.question,
      date: formatDate(Date.now())
    };

    // Добавление вопроса в список
    addQuestion(question);

    // Сброс формы
    form.reset();
    submitBtn.disabled = true;

    // Показ сообщения об успехе
    showSuccessMessage(question.name);
  });
}

/**
 * Показывает сообщение об успешной отправке
 * @param {string} name - Имя отправителя
 */
function showSuccessMessage(name) {
  const result = document.getElementById('result');
  if (!result) return;

  result.textContent = `Сообщение отправлено. Спасибо, ${name}!`;
  result.setAttribute('role', 'status');

  setTimeout(() => {
    result.textContent = '';
    result.removeAttribute('role');
  }, 4000);
}
