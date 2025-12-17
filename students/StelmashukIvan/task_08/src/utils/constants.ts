// Жанры книг
export const GENRES = [
  'Фантастика',
  'Фэнтези',
  'Детектив',
  'Роман',
  'Научная литература',
  'Биография',
  'Исторический',
  'Ужасы',
  'Приключения',
  'Драма',
  'Комедия',
  'Поэзия',
  'Детская литература',
  'Классика',
  'Антиутопия',
  'Триллер',
  'Мистика',
  'Психология',
  'Философия',
  'Научпоп',
] as const

// Годы для фильтрации
export const PUBLISHED_YEARS = Array.from(
  { length: new Date().getFullYear() - 1900 + 1 },
  (_, i) => 1900 + i
).reverse()

// Рейтинги
export const RATING_OPTIONS = [
  { value: 5, label: 'Отлично (5 звёзд)' },
  { value: 4, label: 'Хорошо (4 звезды)' },
  { value: 3, label: 'Удовлетворительно (3 звезды)' },
  { value: 2, label: 'Неудовлетворительно (2 звезды)' },
  { value: 1, label: 'Плохо (1 звезда)' },
]

// Сортировка
export const SORT_OPTIONS = [
  { value: 'title-asc', label: 'По названию (А-Я)' },
  { value: 'title-desc', label: 'По названию (Я-А)' },
  { value: 'year-desc', label: 'По году (новые)' },
  { value: 'year-asc', label: 'По году (старые)' },
  { value: 'rating-desc', label: 'По рейтингу (высокий)' },
  { value: 'rating-asc', label: 'По рейтингу (низкий)' },
]

// API константы
export const API_CONSTANTS = {
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
  CACHE_TIME: 5 * 60 * 1000, // 5 минут
}

// Локализация
export const LOCALE = {
  dateFormat: 'dd.MM.yyyy',
  timeFormat: 'HH:mm',
  currency: 'руб.',
}

// Пагинация
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
}

// Цветовые темы
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

// Ключи localStorage
export const STORAGE_KEYS = {
  THEME: 'book-catalog-theme',
  FAVORITES: 'book-catalog-favorites',
  RECENTLY_VIEWED: 'book-catalog-recently-viewed',
  SEARCH_HISTORY: 'book-catalog-search-history',
  USER_PREFERENCES: 'book-catalog-user-preferences',
}

// Дефолтные значения
export const DEFAULTS = {
  COVER_IMAGE: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
  AVATAR_IMAGE: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w-400&h=400&fit=crop',
}

// Сообщения
export const MESSAGES = {
  LOADING: 'Загрузка...',
  NO_DATA: 'Данные не найдены',
  ERROR: 'Произошла ошибка',
  SUCCESS: 'Успешно',
  CONFIRM_DELETE: 'Вы уверены, что хотите удалить этот элемент?',
  CONFIRM_LOGOUT: 'Вы уверены, что хотите выйти?',
} as const