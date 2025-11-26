/**
 * Главный модуль приложения
 * @module main
 */

import { initTabs } from './components/tabs.js';
import { initModal } from './components/modal.js';
import { initForm } from './features/form.js';
import { initQuestions } from './features/questions.js';
import { initTheme } from './components/theme.js';

/**
 * Инициализация приложения
 */
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем все компоненты
  initTabs();
  initModal();
  initForm();
  initQuestions();
  initTheme();

  console.log('✅ Приложение инициализировано');
});
