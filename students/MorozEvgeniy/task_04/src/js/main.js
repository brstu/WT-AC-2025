import { route, navigate } from './router.js';
import { listPage } from './views/list.js';
import { detailPage } from './views/detail.js';
import { formPage } from './views/form.js';

// Определение маршрутов
route('/items', listPage);           // Список
route('/new', formPage);             // Создание
route('/items/:id', detailPage);     // Просмотр детали
route('/items/:id/edit', formPage);  // Редактирование

// Инициализация
window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);