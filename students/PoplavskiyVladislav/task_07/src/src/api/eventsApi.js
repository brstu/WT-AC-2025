const API_URL = import.meta.env.VITE_API_URL

export const eventsApi = {
  // Получить все мероприятия
  async getAll() {
    const response = await fetch(`${API_URL}/events`)
    if (!response.ok) throw new Error('Ошибка при загрузке мероприятий')
    return response.json()
  },

  // Получить мероприятие по ID
  async getById(id) {
    const response = await fetch(`${API_URL}/events/${id}`)
    if (!response.ok) throw new Error('Мероприятие не найдено')
    return response.json()
  },

  // Создать мероприятие
  async create(eventData) {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })
    if (!response.ok) throw new Error('Ошибка при создании мероприятия')
    return response.json()
  },

  // Обновить мероприятие
  async update(id, eventData) {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })
    if (!response.ok) throw new Error('Ошибка при обновлении мероприятия')
    return response.json()
  },

  // Удалить мероприятие
  async delete(id) {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Ошибка при удалении мероприятия')
    return response.json()
  },
}