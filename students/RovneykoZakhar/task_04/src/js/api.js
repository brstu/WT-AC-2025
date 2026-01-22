export default class API {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                console.error(`HTTP error! Status: ${response.status}`);
            }
            
            // Для DELETE запросов может не быть тела ответа
            if (response.status === 204) {
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // CRUD операции для комиксов
    async getRecipes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/recipes?${queryString}` : '/recipes';
        return this.request(endpoint);
    }
    
    async getRecipe(id) {
        return this.request(`/recipes/${id}`);
    }
    
    async createRecipe(comicData) {
        return this.request('/recipes', {
            method: 'POST',
            body: JSON.stringify(comicData),
        });
    }
    
    async updateRecipe(id, comicData) {
        return this.request(`/recipes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(comicData),
        });
    }
    
    async deleteRecipe(id) {
        return this.request(`/recipes/${id}`, {
            method: 'DELETE',
        });
    }

    async createReview(comicId, reviewData) {
        return this.request(`/recipes/${comicId}/reviews`, {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    }
}