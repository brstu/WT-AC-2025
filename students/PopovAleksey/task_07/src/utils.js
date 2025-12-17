export function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU')
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function validateYear(year) {
  if (year < 1800) return false
  if (year > 2025) return false
  return true
}

export const CATEGORIES = ['Пейзаж', 'Портрет', 'Натюрморт', 'Абстракция', 'Другое']
