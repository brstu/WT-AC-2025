/**
 * Данные об уроках и их содержании
 * @module data/lessons
 */

/**
 * Метаданные уроков
 * @type {Object.<string, {authors: string[], duration: string, tags: string[], level: string}>}
 */
export const lessonsMeta = {
  'html-1': { 
    authors: ['Иван Иванов', 'Мария Петрова'], 
    duration: '40 мин', 
    tags: ['HTML', 'Семантика', 'Формы'], 
    level: 'Начальный' 
  },
  'html-2': { 
    authors: ['Мария Петрова'], 
    duration: '55 мин', 
    tags: ['HTML', 'Доступность', 'Формы'], 
    level: 'Начальный' 
  },
  'css-1': { 
    authors: ['Олег Смирнов'], 
    duration: '60 мин', 
    tags: ['CSS', 'Flexbox'], 
    level: 'Начальный' 
  },
  'css-2': { 
    authors: ['Елена Новикова'], 
    duration: '50 мин', 
    tags: ['CSS', 'Адаптивность'], 
    level: 'Средний' 
  },
  'js-1': { 
    authors: ['Анна Кузнецова'], 
    duration: '75 мин', 
    tags: ['JavaScript', 'DOM'], 
    level: 'Средний' 
  },
  'js-2': { 
    authors: ['Сергей Ковалёв'], 
    duration: '80 мин', 
    tags: ['JavaScript', 'События'], 
    level: 'Средний' 
  }
};

/**
 * Темы каждого урока
 * @type {Object.<string, string[]>}
 */
export const lessonsTopics = {
  'html-1': [
    'Структура HTML-документа: <!doctype>, head и body',
    'Семантические элементы: header, main, article, section, footer',
    'Практика: создание простой страницы с семантикой'
  ],
  'html-2': [
    'Формы: input, textarea, select и их типы',
    'Ассоциированные label и улучшение UX для форм',
    'ARIA-атрибуты и базовая доступность форм'
  ],
  'css-1': [
    'Flex container: display, flex-direction, flex-wrap',
    'Flex items: flex-grow, flex-shrink, flex-basis',
    'Практическая верстка: адаптивные карточки и навигация'
  ],
  'css-2': [
    'Mobile‑first подход и планирование точек перелома',
    'Медиазапросы, относительные единицы и макеты под разные экраны',
    'Оптимизация изображений и responsive techniques'
  ],
  'js-1': [
    'Навигация по DOM: parentNode, children, querySelector',
    'Создание/удаление элементов, DocumentFragment для производительности',
    'Практическое задание: динамическая галерея'
  ],
  'js-2': [
    'Пропагирование событий: capture vs bubble',
    'Делегирование событий: почему и когда использовать',
    'Паттерны: отписка обработчиков, предотвращение утечек'
  ]
};

/**
 * Получает метаданные урока по ID
 * @param {string} id - ID урока
 * @returns {{authors: string[], duration: string, tags: string[], level: string}}
 */
export function getLessonMeta(id) {
  return lessonsMeta[id] || { 
    authors: ['Преподаватель'], 
    duration: '30 мин', 
    tags: ['Общее'], 
    level: 'Общий' 
  };
}

/**
 * Получает список тем урока по ID
 * @param {string} id - ID урока
 * @returns {string[]}
 */
export function getLessonTopics(id) {
  return lessonsTopics[id] || [
    'Краткий обзор темы и цели занятия',
    'Практическая часть с пошаговыми заданиями',
    'Домашнее задание и полезные ресурсы'
  ];
}
