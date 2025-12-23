// Утилиты для работы с API

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Общая функция для запросов
export async function fetchApi(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      )
    }

    // Для DELETE запросов может не быть тела
    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// GET запросы
export async function getEvents(params = {}) {
  const queryString = new URLSearchParams(params).toString()
  return fetchApi(`/events${queryString ? `?${queryString}` : ''}`)
}

export async function getEventById(id) {
  return fetchApi(`/events/${id}`)
}

// POST запросы
export async function createEvent(eventData) {
  return fetchApi('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  })
}

// PUT запросы
export async function updateEvent(id, eventData) {
  return fetchApi(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  })
}

// PATCH запросы
export async function patchEvent(id, updates) {
  return fetchApi(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

// DELETE запросы
export async function deleteEvent(id) {
  return fetchApi(`/events/${id}`, {
    method: 'DELETE',
  })
}

// Запросы для заявок
export async function getApplications(eventId) {
  return fetchApi(`/applications?eventId=${eventId}`)
}

export async function createApplication(applicationData) {
  return fetchApi('/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  })
}

export async function deleteApplication(id) {
  return fetchApi(`/applications/${id}`, {
    method: 'DELETE',
  })
}

// Утилиты для обработки ошибок
export function handleApiError(error) {
  if (error.name === 'AbortError') {
    return 'Запрос был отменен'
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Ошибка соединения с сервером. Проверьте интернет-соединение.'
  }

  return error.message || 'Произошла неизвестная ошибка'
}

// Хелпер для кэширования запросов
const cache = new Map()

export function withCache(key, fetchFn, ttl = 60000) {
  return async (...args) => {
    const cacheKey = `${key}-${JSON.stringify(args)}`
    const now = Date.now()

    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey)
      if (now - timestamp < ttl) {
        return data
      }
    }

    try {
      const data = await fetchFn(...args)
      cache.set(cacheKey, { data, timestamp: now })
      return data
    } catch (error) {
      throw error
    }
  }
}

// Функция для отмены запросов
export function createAbortController() {
  return new AbortController()
}

// Экспорт константы API_URL
export { API_URL }