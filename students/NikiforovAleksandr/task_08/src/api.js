const axios = require('axios');

class MemesAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 5000
    });
  }

  /**
   * Get all memes
   * @param {Object} options - Filter options
   * @returns {Promise<Array>}
   */
  async getMemes(options = {}) {
    try {
      const params = {};
      if (options.search) params.search = options.search;
      if (options.limit) params.limit = options.limit;
      
      const response = await this.client.get('/memes', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching memes:', error.message);
      throw error;
    }
  }

  /**
   * Get meme by ID
   * @param {string} id - Meme ID
   * @returns {Promise<Object>}
   */
  async getMemeById(id) {
    try {
      const response = await this.client.get(`/memes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching meme ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Like a meme
   * @param {string} id - Meme ID
   * @returns {Promise<Object>}
   */
  async likeMeme(id) {
    try {
      const response = await this.client.post(`/memes/${id}/like`);
      return response.data;
    } catch (error) {
      console.error(`Error liking meme ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Increment meme views
   * @param {string} id - Meme ID
   * @returns {Promise<Object>}
   */
  async viewMeme(id) {
    try {
      const response = await this.client.post(`/memes/${id}/view`);
      return response.data;
    } catch (error) {
      console.error(`Error viewing meme ${id}:`, error.message);
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
      console.error('Health check failed:', error.message);
      throw error;
    }
  }

  /**
   * Search memes by query
   * @param {string} query - Search query
   * @returns {Promise<Array>}
   */
  async searchMemes(query) {
    return this.getMemes({ search: query });
  }
}

module.exports = MemesAPI;