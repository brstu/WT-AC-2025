// Импорт модулей
import { initializeAccordion } from './components/accordion.js';
import { initializeTabs } from './components/tabs.js';
import { initializeModal } from './components/modal.js';
import { initializeForm } from './components/form.js';
import { initializeBookList } from './components/bookList.js';
import { initializeTheme } from './components/theme.js';

// Инициализация компонентов после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    initializeAccordion();
    initializeTabs();
    initializeModal();
    initializeForm();
    initializeBookList();
    initializeTheme();
});