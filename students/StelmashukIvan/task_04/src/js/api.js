const API_BASE = 'https://jsonplaceholder.typicode.com';
const MOCK_DELAY = 500;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let mockMemes = JSON.parse(localStorage.getItem('memesCollection')) || [];

let nextId = 1;

function saveToStorage() {
    localStorage.setItem('memesCollection', JSON.stringify(mockMemes));
}

if (mockMemes.length > 0) {
    nextId = Math.max(...mockMemes.map(m => m.id)) + 1;
}

class MemesAPI {
    async getItems(search = '', page = 1, limit = 6) {
        await delay(MOCK_DELAY);

        let filteredMemes = mockMemes;

        if (search) {
            const searchLower = search.toLowerCase();
            filteredMemes = mockMemes.filter(meme =>
                meme.title.toLowerCase().includes(searchLower) ||
                meme.description.toLowerCase().includes(searchLower) ||
                meme.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        const start = (page - 1) * limit;
        const end = start + limit;

        return {
            data: filteredMemes.slice(start, end),
            total: filteredMemes.length
        };
    }

    async getItem(id) {
        await delay(MOCK_DELAY);
        
        const itemId = parseInt(id);
        const item = mockMemes.find(m => m.id === itemId);
        
        if (!item) {
            throw new Error(`Мем с ID ${id} не найден`);
        }
        
        return { data: item };
    }

    async createItem(itemData) {
        await delay(MOCK_DELAY);
        
        if (!itemData.title?.trim()) {
            throw new Error('Название обязательно');
        }
        if (!itemData.description?.trim()) {
            throw new Error('Описание обязательно');
        }
        
        const newItem = {
            id: nextId++,
            title: itemData.title.trim(),
            description: itemData.description.trim(),
            image: itemData.image || `https://via.placeholder.com/400x300/667eea/white?text=Новый+мем`,
            tags: itemData.tags || [],
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        mockMemes.unshift(newItem);
        saveToStorage();
        return { data: newItem };
    }

    async updateItem(id, itemData) {
        await delay(MOCK_DELAY);
        
        const itemId = parseInt(id);
        const index = mockMemes.findIndex(m => m.id === itemId);
        if (index === -1) {
            throw new Error('Мем не найден');
        }
        
        if (!itemData.title?.trim()) {
            throw new Error('Название обязательно');
        }
        if (!itemData.description?.trim()) {
            throw new Error('Описание обязательно');
        }
        
        const updatedItem = {
            ...mockMemes[index],
            title: itemData.title.trim(),
            description: itemData.description.trim(),
            image: itemData.image || mockMemes[index].image,
            tags: itemData.tags || []
        };
        
        mockMemes[index] = updatedItem;
        saveToStorage();
        return { data: updatedItem };
    }

    async deleteItem(id) {
        await delay(MOCK_DELAY);
        
        const itemId = parseInt(id);
        const index = mockMemes.findIndex(m => m.id === itemId);
        if (index === -1) {
            throw new Error('Мем не найден');
        }
        
        mockMemes.splice(index, 1);
        saveToStorage();
        return { message: 'Мем успешно удален' };
    }
}

export const memesAPI = new MemesAPI();