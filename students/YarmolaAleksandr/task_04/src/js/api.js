/**
 * API клиент для работы с IT-инструментами
 * Использует локальное хранилище для эмуляции backend
 */

const STORAGE_KEY = 'it_tools_db';
const DELAY = 500; // Задержка для эмуляции сетевого запроса

/**
 * Инициализация базы данных с демо-данными
 */
function initDatabase() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const demoData = [
            {
                id: 1,
                name: 'Visual Studio Code',
                category: 'IDE',
                description: 'Мощный редактор кода с поддержкой множества языков программирования и расширений',
                website: 'https://code.visualstudio.com',
                license: 'MIT',
                platforms: ['Windows', 'macOS', 'Linux'],
                icon: '💻',
                rating: 5,
                createdAt: new Date('2023-01-15').toISOString()
            },
            {
                id: 2,
                name: 'Docker',
                category: 'DevOps',
                description: 'Платформа для разработки, доставки и запуска приложений в контейнерах',
                website: 'https://www.docker.com',
                license: 'Apache 2.0',
                platforms: ['Windows', 'macOS', 'Linux'],
                icon: '🐳',
                rating: 5,
                createdAt: new Date('2023-02-20').toISOString()
            },
            {
                id: 3,
                name: 'Postman',
                category: 'API Testing',
                description: 'Инструмент для тестирования и документирования API',
                website: 'https://www.postman.com',
                license: 'Proprietary',
                platforms: ['Windows', 'macOS', 'Linux', 'Web'],
                icon: '📮',
                rating: 4,
                createdAt: new Date('2023-03-10').toISOString()
            },
            {
                id: 4,
                name: 'Git',
                category: 'Version Control',
                description: 'Распределенная система контроля версий для отслеживания изменений в коде',
                website: 'https://git-scm.com',
                license: 'GPL-2.0',
                platforms: ['Windows', 'macOS', 'Linux'],
                icon: '🌿',
                rating: 5,
                createdAt: new Date('2023-01-05').toISOString()
            },
            {
                id: 5,
                name: 'Figma',
                category: 'Design',
                description: 'Инструмент для совместного проектирования интерфейсов',
                website: 'https://www.figma.com',
                license: 'Proprietary',
                platforms: ['Web', 'macOS', 'Windows'],
                icon: '🎨',
                rating: 5,
                createdAt: new Date('2023-04-12').toISOString()
            },
            {
                id: 6,
                name: 'Jenkins',
                category: 'CI/CD',
                description: 'Сервер автоматизации с открытым исходным кодом для CI/CD',
                website: 'https://www.jenkins.io',
                license: 'MIT',
                platforms: ['Cross-platform'],
                icon: '🔧',
                rating: 4,
                createdAt: new Date('2023-02-28').toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
    }
}

/**
 * Получить все данные из localStorage
 */
function getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Сохранить данные в localStorage
 */
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Эмуляция задержки сети
 */
function delay() {
    return new Promise(resolve => setTimeout(resolve, DELAY));
}

/**
 * API класс для работы с IT-инструментами
 */
export class ToolsAPI {
    constructor(auth = null) {
        this.auth = auth;
        initDatabase();
    }

    /**
     * Получить заголовки с токеном авторизации
     * @returns {Object} Объект заголовков
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.auth && this.auth.isAuthenticated()) {
            headers['Authorization'] = `Bearer ${this.auth.getToken()}`;
        }

        return headers;
    }

    /**
     * Логирование запроса с токеном (для демонстрации)
     */
    logRequest(method, endpoint) {
        const headers = this.getHeaders();
        console.log(`🌐 ${method} ${endpoint}`, headers);
    }

    /**
     * Получить список всех инструментов с фильтрацией и поиском
     * @param {Object} options - Параметры фильтрации
     * @param {string} options.search - Поисковый запрос
     * @param {string} options.category - Фильтр по категории
     * @param {string} options.sort - Сортировка (name, rating, date)
     * @returns {Promise<Array>} Список инструментов
     */
    async getAll({ search = '', category = '', sort = 'name' } = {}) {
        this.logRequest('GET', '/api/tools');
        await delay();
        
        let tools = getData();

        // Фильтрация по поиску
        if (search) {
            const searchLower = search.toLowerCase();
            tools = tools.filter(tool =>
                tool.name.toLowerCase().includes(searchLower) ||
                tool.description.toLowerCase().includes(searchLower)
            );
        }

        // Фильтрация по категории
        if (category && category !== 'all') {
            tools = tools.filter(tool => tool.category === category);
        }

        // Сортировка
        switch (sort) {
            case 'name':
                tools.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                tools.sort((a, b) => b.rating - a.rating);
                break;
            case 'date':
                tools.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        return tools;
    }

    /**
     * Получить инструмент по ID
     * @param {number} id - ID инструмента
     * @returns {Promise<Object|null>} Инструмент или null
     */
    async getById(id) {
        this.logRequest('GET', `/api/tools/${id}`);
        await delay();
        
        const tools = getData();
        const tool = tools.find(t => t.id === parseInt(id));
        
        if (!tool) {
            throw new Error(`Инструмент с ID ${id} не найден`);
        }
        
        return tool;
    }

    /**
     * Создать новый инструмент
     * @param {Object} toolData - Данные инструмента
     * @returns {Promise<Object>} Созданный инструмент
     */
    async create(toolData) {
        this.logRequest('POST', '/api/tools');
        await delay();
        
        const tools = getData();
        const newId = tools.length > 0 ? Math.max(...tools.map(t => t.id)) + 1 : 1;
        
        const newTool = {
            id: newId,
            ...toolData,
            createdAt: new Date().toISOString()
        };

        tools.push(newTool);
        saveData(tools);
        
        return newTool;
    }

    /**
     * Обновить инструмент
     * @param {number} id - ID инструмента
     * @param {Object} toolData - Новые данные
     * @returns {Promise<Object>} Обновленный инструмент
     */
    async update(id, toolData) {
        this.logRequest('PUT', `/api/tools/${id}`);
        await delay();
        
        const tools = getData();
        const index = tools.findIndex(t => t.id === parseInt(id));
        
        if (index === -1) {
            throw new Error(`Инструмент с ID ${id} не найден`);
        }

        tools[index] = {
            ...tools[index],
            ...toolData,
            id: tools[index].id, // ID не изменяется
            createdAt: tools[index].createdAt // Дата создания не изменяется
        };

        saveData(tools);
        return tools[index];
    }

    /**
     * Удалить инструмент
     * @param {number} id - ID инструмента
     * @returns {Promise<boolean>} true если удален успешно
     */
    async delete(id) {
        this.logRequest('DELETE', `/api/tools/${id}`);
        await delay();
        
        const tools = getData();
        const filteredTools = tools.filter(t => t.id !== parseInt(id));
        
        if (filteredTools.length === tools.length) {
            throw new Error(`Инструмент с ID ${id} не найден`);
        }

        saveData(filteredTools);
        return true;
    }

    /**
     * Получить список всех категорий
     * @returns {Promise<Array<string>>} Список уникальных категорий
     */
    async getCategories() {
        await delay();
        
        const tools = getData();
        const categories = [...new Set(tools.map(t => t.category))];
        return categories.sort();
    }
}
