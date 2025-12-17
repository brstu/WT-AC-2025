// API модуль для работы с REST API (json-server)
// Все CRUD операции для проектов портфолио

const BASE_URL = 'http://localhost:3000';
const RESOURCE = 'projects';

/**
 * Обработчик ответов от сервера
 * Проверяет статус и преобразует в JSON
 */
async function handle(response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  /**
   * GET /projects - получить список всех проектов
   * @param {string} query - поисковый запрос (опционально)
   * @returns {Promise<Array>} массив проектов
   */
  async listProjects(query = '') {
    let url = `${BASE_URL}/${RESOURCE}`;
    if (query) {
      url += `?q=${encodeURIComponent(query)}`;
    }
    const res = await fetch(url);
    return handle(res);
  },

  /**
   * GET /projects/:id - получить один проект
   * @param {string|number} id - ID проекта
   * @returns {Promise<Object>} объект проекта
   */
  async getProject(id) {
    const res = await fetch(`${BASE_URL}/${RESOURCE}/${id}`);
    return handle(res);
  },

  /**
   * POST /projects - создать новый проект
   * @param {Object} data - данные проекта
   * @returns {Promise<Object>} созданный проект
   */
  async createProject(data) {
    const projectData = {
      ...data,
      createdAt: new Date().toISOString(),
      tags: data.tags || [],
    };
    
    const res = await fetch(`${BASE_URL}/${RESOURCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    return handle(res);
  },

  /**
   * PUT /projects/:id - обновить существующий проект
   * @param {string|number} id - ID проекта
   * @param {Object} data - новые данные проекта
   * @returns {Promise<Object>} обновлённый проект
   */
  async updateProject(id, data) {
    const res = await fetch(`${BASE_URL}/${RESOURCE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handle(res);
  },

  /**
   * DELETE /projects/:id - удалить проект
   * @param {string|number} id - ID проекта
   * @returns {Promise<boolean>} true если успешно
   */
  async deleteProject(id) {
    const res = await fetch(`${BASE_URL}/${RESOURCE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Не удалось удалить проект');
    }
    return true;
  },
};
