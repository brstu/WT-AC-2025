// Утилиты для форматирования дат

/**
 * Форматирует дату в русском формате
 * @param {string|Date} date - Дата для форматирования
 * @param {Object} options - Дополнительные опции
 * @returns {string} Отформатированная дата
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('ru-RU', { ...defaultOptions, ...options }).format(dateObj)
}

/**
 * Форматирует дату в коротком формате
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Дата в формате ДД.ММ.ГГГГ
 */
export function formatShortDate(date) {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: undefined,
    minute: undefined
  })
}

/**
 * Форматирует дату в формате для формы
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Дата в формате YYYY-MM-DDThh:mm
 */
export function formatDateTimeLocal(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const pad = (num) => num.toString().padStart(2, '0')
  
  const year = dateObj.getFullYear()
  const month = pad(dateObj.getMonth() + 1)
  const day = pad(dateObj.getDate())
  const hours = pad(dateObj.getHours())
  const minutes = pad(dateObj.getMinutes())
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Форматирует время до события
 * @param {string|Date} date - Дата события
 * @returns {string} Строка с временем до события
 */
export function formatTimeUntil(date) {
  const now = new Date()
  const eventDate = typeof date === 'string' ? new Date(date) : date
  const diffMs = eventDate - now
  
  if (diffMs < 0) {
    return 'Мероприятие завершено'
  }
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffDays > 0) {
    return `Через ${diffDays} ${getDayWord(diffDays)}`
  } else if (diffHours > 0) {
    return `Через ${diffHours} ${getHourWord(diffHours)}`
  } else {
    return `Через ${diffMinutes} ${getMinuteWord(diffMinutes)}`
  }
}

/**
 * Форматирует продолжительность мероприятия
 * @param {string|Date} startDate - Дата начала
 * @param {string|Date} endDate - Дата окончания
 * @returns {string} Отформатированная продолжительность
 */
export function formatDuration(startDate, endDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  const diffMs = end - start
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours} ${getHourWord(diffHours)} ${diffMinutes > 0 ? `${diffMinutes} ${getMinuteWord(diffMinutes)}` : ''}`
  } else {
    return `${diffMinutes} ${getMinuteWord(diffMinutes)}`
  }
}

/**
 * Проверяет, является ли дата прошедшей
 * @param {string|Date} date - Дата для проверки
 * @returns {boolean} true если дата в прошлом
 */
export function isPastDate(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj < new Date()
}

/**
 * Проверяет, является ли дата сегодняшней
 * @param {string|Date} date - Дата для проверки
 * @returns {boolean} true если дата сегодня
 */
export function isToday(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
}

// Вспомогательные функции для склонения слов
function getDayWord(count) {
  if (count % 10 === 1 && count % 100 !== 11) return 'день'
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'дня'
  return 'дней'
}

function getHourWord(count) {
  if (count % 10 === 1 && count % 100 !== 11) return 'час'
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'часа'
  return 'часов'
}

function getMinuteWord(count) {
  if (count % 10 === 1 && count % 100 !== 11) return 'минута'
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'минуты'
  return 'минут'
}

export default {
  formatDate,
  formatShortDate,
  formatDateTimeLocal,
  formatTimeUntil,
  formatDuration,
  isPastDate,
  isToday
}