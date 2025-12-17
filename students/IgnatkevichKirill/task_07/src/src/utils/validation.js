export const validateGameForm = (data) => {
  const errors = {}

  if (!data.title || data.title.trim() === '') {
    errors.title = 'Название обязательно'
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = 'Описание обязательно'
  }

  if (!data.minPlayers || data.minPlayers < 1) {
    errors.minPlayers = 'Минимальное количество игроков должно быть не менее 1'
  }

  if (!data.maxPlayers || data.maxPlayers < data.minPlayers) {
    errors.maxPlayers = 'Максимальное количество игроков должно быть больше минимального'
  }

  if (!data.playTime || data.playTime < 1) {
    errors.playTime = 'Время игры должно быть положительным числом'
  }

  if (!data.complexity || data.complexity < 1 || data.complexity > 5) {
    errors.complexity = 'Сложность должна быть от 1 до 5'
  }

  if (!data.rating || data.rating < 1 || data.rating > 10) {
    errors.rating = 'Рейтинг должен быть от 1 до 10'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}