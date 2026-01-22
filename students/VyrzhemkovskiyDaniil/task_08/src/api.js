const axios = require('axios');

class TasksAPI {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
        this.client = axios.create({
            baseURL,
            timeout: 5000
        });
    }

    /**
     * Get all tasks
     * @param {Object} options - Filter options
     * @returns {Promise<Array>}
     */
    async getTasks(options = {}) {
        try {
            const params = {};
            if (options.completed !== undefined) params.completed = options.completed;
            if (options.priority) params.priority = options.priority;
            
            const response = await this.client.get('/tasks', { params });
            return response.data;
        } catch (error) {
            console.error('Ошибка получения задач:', error.message);
            throw error;
        }
    }

    /**
     * Get task by ID
     * @param {string} id - Task ID
     * @returns {Promise<Object>}
     */
    async getTaskById(id) {
        try {
            const response = await this.client.get(`/tasks/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка получения задачи ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Create new task
     * @param {Object} taskData - Task data
     * @returns {Promise<Object>}
     */
    async createTask(taskData) {
        try {
            const response = await this.client.post('/tasks', taskData);
            return response.data;
        } catch (error) {
            console.error('Ошибка создания задачи:', error.message);
            throw error;
        }
    }

    /**
     * Update task
     * @param {string} id - Task ID
     * @param {Object} updates - Updates
     * @returns {Promise<Object>}
     */
    async updateTask(id, updates) {
        try {
            const response = await this.client.put(`/tasks/${id}`, updates);
            return response.data;
        } catch (error) {
            console.error(`Ошибка обновления задачи ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Delete task
     * @param {string} id - Task ID
     * @returns {Promise<Object>}
     */
    async deleteTask(id) {
        try {
            const response = await this.client.delete(`/tasks/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка удаления задачи ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Toggle task completion status
     * @param {string} id - Task ID
     * @returns {Promise<Object>}
     */
    async toggleTaskCompletion(id) {
        try {
            const response = await this.client.patch(`/tasks/${id}/toggle`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка переключения статуса задачи ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Get tasks statistics
     * @returns {Promise<Object>}
     */
    async getStats() {
        try {
            const response = await this.client.get('/stats');
            return response.data;
        } catch (error) {
            console.error('Ошибка получения статистики:', error.message);
            throw error;
        }
    }

    /**
     * Check API health
     * @returns {Promise<Object>}
     */
    async checkHealth() {
        try {
            const response = await this.client.get('/health');
            return response.data;
        } catch (error) {
            console.error('Проверка здоровья не удалась:', error.message);
            throw error;
        }
    }
}

module.exports = TasksAPI;