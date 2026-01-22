class HackathonAPI {
    constructor() {
        this.baseUrl = 'https://jsonplaceholder.typicode.com';
        

        this.localStorageKey = 'hackathons_data_v2';
        this.hackathons = this.loadFromLocalStorage();
        this.nextId = this.hackathons.length > 0 ? 
            Math.max(...this.hackathons.map(h => h.id)) + 1 : 1;
        
   
        this.config = {
            useJsonPlaceholder: true, 
            simulateDelay: true,    
            debugMode: true         
        };
    }
    
 
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(this.localStorageKey);
            if (saved) {
                const data = JSON.parse(saved);
                if (this.config.debugMode) console.log('Загружено из localStorage:', data.length, 'хакатонов');
                return data;
            }
            return this.generateMockHackathons();
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return this.generateMockHackathons();
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.hackathons));
            if (this.config.debugMode) console.log('Сохранено в localStorage:', this.hackathons.length, 'хакатонов');
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
        }
    }

    generateMockHackathons() {
        const mockData = [
            {
                id: 1,
                title: "AI Hackathon 2023",
                description: "Соревнование по созданию инновационных решений в области искусственного интеллекта и машинного обучения.",
                category: "AI/ML",
                location: "Москва",
                startDate: "2023-10-15",
                endDate: "2023-10-17",
                prize: 500000,
                maxParticipants: 100,
                currentParticipants: 78,
                organizer: "Tech Giants Inc.",
                website: "https://ai-hackathon.example.com",
                requirements: "Знание Python, основы ML, опыт работы с TensorFlow/PyTorch",
                createdAt: "2023-09-01T10:00:00Z",
                status: "completed"
            },
            {
                id: 2,
                title: "Web3 Blockchain Challenge",
                description: "Хакатон по разработке децентрализованных приложений на блокчейне Ethereum.",
                category: "Blockchain",
                location: "Санкт-Петербург",
                startDate: "2023-11-05",
                endDate: "2023-11-07",
                prize: 300000,
                maxParticipants: 80,
                currentParticipants: 80,
                organizer: "Blockchain Association",
                website: "https://web3-hack.example.com",
                requirements: "Опыт работы с Solidity, Web3.js, основы криптографии",
                createdAt: "2023-09-15T10:00:00Z",
                status: "upcoming"
            },
            {
                id: 3,
                title: "FinTech Innovation Cup",
                description: "Разработка инновационных решений для финансового сектора и банковской индустрии.",
                category: "FinTech",
                location: "Новосибирск",
                startDate: "2023-09-20",
                endDate: "2023-09-22",
                prize: 750000,
                maxParticipants: 120,
                currentParticipants: 95,
                organizer: "Banking Consortium",
                website: "https://fintech-hack.example.com",
                requirements: "Понимание финансовых систем, опыт разработки API",
                createdAt: "2023-08-20T10:00:00Z",
                status: "ongoing"
            },
            {
                id: 4,
                title: "GreenTech Sustainability Hack",
                description: "Создание технологических решений для экологических проблем и устойчивого развития.",
                category: "EcoTech",
                location: "Казань",
                startDate: "2023-12-01",
                endDate: "2023-12-03",
                prize: 400000,
                maxParticipants: 90,
                currentParticipants: 45,
                organizer: "Green Future Foundation",
                website: "https://greentech-hack.example.com",
                requirements: "Интерес к экологии, навыки разработки, аналитическое мышление",
                createdAt: "2023-10-01T10:00:00Z",
                status: "upcoming"
            },
            {
                id: 5,
                title: "HealthTech Medical Innovation",
                description: "Разработка решений для улучшения здравоохранения и медицинских услуг.",
                category: "HealthTech",
                location: "Екатеринбург",
                startDate: "2024-01-15",
                endDate: "2024-01-17",
                prize: 600000,
                maxParticipants: 70,
                currentParticipants: 52,
                organizer: "Medical Innovation Lab",
                website: "https://healthtech-hack.example.com",
                requirements: "Понимание медицинских процессов, опыт в разработке, креативность",
                createdAt: "2023-11-01T10:00:00Z",
                status: "upcoming"
            }
        ];
        
        if (this.config.debugMode) console.log('Сгенерированы mock-данные:', mockData.length, 'хакатонов');
        return mockData;
    }

    async delay(ms = 500) {
        if (!this.config.simulateDelay) return;
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logAction(action, data = null) {
        if (!this.config.debugMode) return;
        console.log(`[HackathonAPI] ${action}`, data || '');
    }

    getHackathonStatus(startDate, endDate) {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (now < start) return "upcoming";
        if (now > end) return "completed";
        return "ongoing";
    }

    async getHackathons(params = {}) {
        this.logAction('getHackathons', params);
        await this.delay();
        
        let data = [...this.hackathons];

        data = data.map(hackathon => ({
            ...hackathon,
            status: this.getHackathonStatus(hackathon.startDate, hackathon.endDate)
        }));

        if (params.search) {
            const search = params.search.toLowerCase();
            data = data.filter(h => 
                h.title.toLowerCase().includes(search) ||
                h.description.toLowerCase().includes(search) ||
                h.category.toLowerCase().includes(search) ||
                h.location.toLowerCase().includes(search)
            );
        }
        
        if (params.category && params.category !== 'all') {
            data = data.filter(h => h.category === params.category);
        }
        
        if (params.status && params.status !== 'all') {
            data = data.filter(h => h.status === params.status);
        }

        if (params.sort === 'newest') {
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (params.sort === 'oldest') {
            data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (params.sort === 'prize_high') {
            data.sort((a, b) => b.prize - a.prize);
        } else if (params.sort === 'prize_low') {
            data.sort((a, b) => a.prize - b.prize);
        } else if (params.sort === 'date_asc') {
            data.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        } else if (params.sort === 'date_desc') {
            data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        }

        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 6;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedData = data.slice(startIndex, endIndex);
        
        const result = {
            data: paginatedData,
            total: data.length,
            page,
            totalPages: Math.ceil(data.length / limit),
            hasNextPage: endIndex < data.length,
            hasPrevPage: page > 1,
            filters: params
        };
        
        this.logAction('getHackathons result', result);
        return result;
    }
    
    async getHackathon(id) {
        this.logAction('getHackathon', { id });
        await this.delay(300);
        
        const hackathon = this.hackathons.find(h => h.id === parseInt(id));
        
        if (hackathon) {

            const updatedHackathon = {
                ...hackathon,
                status: this.getHackathonStatus(hackathon.startDate, hackathon.endDate)
            };
            this.logAction('getHackathon found', updatedHackathon);
            return updatedHackathon;
        }

        if (this.config.useJsonPlaceholder) {
            try {
                this.logAction('Trying JSONPlaceholder for hackathon', id);
                const response = await fetch(`${this.baseUrl}/posts/${id}`);
                if (response.ok) {
                    const post = await response.json();
                    const demoHackathon = {
                        id: post.id,
                        title: post.title,
                        description: post.body,
                        category: "Demo",
                        location: "Онлайн",
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        prize: 100000,
                        maxParticipants: 50,
                        currentParticipants: Math.floor(Math.random() * 50),
                        organizer: "JSONPlaceholder Demo",
                        website: "https://jsonplaceholder.typicode.com",
                        requirements: "Для демонстрации работы API",
                        createdAt: new Date().toISOString(),
                        status: "upcoming"
                    };
                    this.logAction('JSONPlaceholder demo hackathon', demoHackathon);
                    return demoHackathon;
                }
            } catch (error) {
                this.logAction('JSONPlaceholder error', error.message);
            }
        }
        
        throw new Error(`Хакатон с ID ${id} не найден`);
    }

    async createHackathon(hackathonData) {
        this.logAction('createHackathon', hackathonData);
        await this.delay(800);

        const errors = [];
        if (!hackathonData.title || hackathonData.title.trim().length < 3) {
            errors.push('Название должно содержать минимум 3 символа');
        }
        if (!hackathonData.description || hackathonData.description.trim().length < 10) {
            errors.push('Описание должно содержать минимум 10 символов');
        }
        if (!hackathonData.category) {
            errors.push('Выберите категорию');
        }
        if (!hackathonData.location) {
            errors.push('Укажите место проведения');
        }
        
        const startDate = new Date(hackathonData.startDate);
        const endDate = new Date(hackathonData.endDate);
        if (startDate >= endDate) {
            errors.push('Дата окончания должна быть позже даты начала');
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        if (this.config.useJsonPlaceholder) {
            try {
                this.logAction('Sending to JSONPlaceholder (POST)');
                const response = await fetch(`${this.baseUrl}/posts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: hackathonData.title,
                        body: hackathonData.description,
                        userId: 1
                    })
                });
                
                if (response.ok) {
                    const jsonPlaceholderResult = await response.json();
                    this.logAction('JSONPlaceholder response', jsonPlaceholderResult);
                } else {
                    this.logAction('JSONPlaceholder error', response.status);
                }
            } catch (error) {
                this.logAction('JSONPlaceholder network error', error.message);
            }
        }

        const newHackathon = {
            id: this.nextId++,
            ...hackathonData,
            prize: parseInt(hackathonData.prize) || 0,
            maxParticipants: parseInt(hackathonData.maxParticipants) || 50,
            currentParticipants: 0,
            createdAt: new Date().toISOString(),
            status: this.getHackathonStatus(hackathonData.startDate, hackathonData.endDate)
        };

        this.hackathons.push(newHackathon);
        this.saveToLocalStorage();

        this.nextId = Math.max(...this.hackathons.map(h => h.id)) + 1;
        
        this.logAction('Hackathon created', newHackathon);
        return newHackathon;
    }

    async updateHackathon(id, updateData) {
        this.logAction('updateHackathon', { id, updateData });
        await this.delay(800);
        
        const index = this.hackathons.findIndex(h => h.id === parseInt(id));
        
        if (index === -1) {
            throw new Error(`Хакатон с ID ${id} не найден`);
        }
        
        if (updateData.startDate && updateData.endDate) {
            const startDate = new Date(updateData.startDate);
            const endDate = new Date(updateData.endDate);
            if (startDate >= endDate) {
                throw new Error('Дата окончания должна быть позже даты начала');
            }
        }

        if (this.config.useJsonPlaceholder) {
            try {
                this.logAction('Sending to JSONPlaceholder (PUT)');
                const response = await fetch(`${this.baseUrl}/posts/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id,
                        title: updateData.title || this.hackathons[index].title,
                        body: updateData.description || this.hackathons[index].description,
                        userId: 1
                    })
                });
                
                if (response.ok) {
                    const jsonPlaceholderResult = await response.json();
                    this.logAction('JSONPlaceholder response', jsonPlaceholderResult);
                } else {
                    this.logAction('JSONPlaceholder error', response.status);
                }
            } catch (error) {
                this.logAction('JSONPlaceholder network error', error.message);
            }
        }

        const updatedHackathon = {
            ...this.hackathons[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        if (updateData.prize !== undefined) {
            updatedHackathon.prize = parseInt(updateData.prize);
        }
        if (updateData.maxParticipants !== undefined) {
            updatedHackathon.maxParticipants = parseInt(updateData.maxParticipants);
        }

        updatedHackathon.status = this.getHackathonStatus(
            updatedHackathon.startDate, 
            updatedHackathon.endDate
        );
        
        this.hackathons[index] = updatedHackathon;
        this.saveToLocalStorage();
        
        this.logAction('Hackathon updated', updatedHackathon);
        return updatedHackathon;
    }

    async deleteHackathon(id) {
        this.logAction('deleteHackathon', { id });
        await this.delay(800);
        
        const index = this.hackathons.findIndex(h => h.id === parseInt(id));
        
        if (index === -1) {
            throw new Error(`Хакатон с ID ${id} не найден`);
        }

        if (this.config.useJsonPlaceholder) {
            try {
                this.logAction('Sending to JSONPlaceholder (DELETE)');
                const response = await fetch(`${this.baseUrl}/posts/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    const jsonPlaceholderResult = await response.json();
                    this.logAction('JSONPlaceholder response', jsonPlaceholderResult);
                } else {
                    this.logAction('JSONPlaceholder error', response.status);
                }
            } catch (error) {
                this.logAction('JSONPlaceholder network error', error.message);
            }
        }

        const deletedHackathon = this.hackathons[index];
        this.hackathons.splice(index, 1);
        this.saveToLocalStorage();
        
        this.logAction('Hackathon deleted', deletedHackathon);
        return deletedHackathon;
    }

    async getStats() {
        this.logAction('getStats');
        await this.delay();
        
        const totalHackathons = this.hackathons.length;
        const totalParticipants = this.hackathons.reduce((sum, h) => sum + h.currentParticipants, 0);
        const totalPrize = this.hackathons.reduce((sum, h) => sum + h.prize, 0);
        const avgPrize = totalHackathons > 0 ? Math.round(totalPrize / totalHackathons) : 0;

        const categories = {};
        const categoryParticipants = {};
        const categoryPrizes = {};
        
        this.hackathons.forEach(h => {
            categories[h.category] = (categories[h.category] || 0) + 1;
            categoryParticipants[h.category] = (categoryParticipants[h.category] || 0) + h.currentParticipants;
            categoryPrizes[h.category] = (categoryPrizes[h.category] || 0) + h.prize;
        });

        const statuses = {
            upcoming: 0,
            ongoing: 0,
            completed: 0
        };
        
        this.hackathons.forEach(h => {
            const status = this.getHackathonStatus(h.startDate, h.endDate);
            statuses[status] = (statuses[status] || 0) + 1;
        });

        const now = new Date();
        const upcomingHackathons = this.hackathons
            .filter(h => this.getHackathonStatus(h.startDate, h.endDate) === 'upcoming')
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 3);

        const recentHackathons = [...this.hackathons]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        
        const stats = {
            totalHackathons,
            totalParticipants,
            totalPrize,
            avgPrize,
            categories,
            categoryParticipants,
            categoryPrizes,
            statuses,
            upcomingHackathons,
            recentHackathons,
            lastUpdated: new Date().toISOString()
        };
        
        this.logAction('Stats calculated', stats);
        return stats;
    }

    async getCategories() {
        this.logAction('getCategories');
        await this.delay(300);
        
        const categories = [...new Set(this.hackathons.map(h => h.category))];
        const categoriesWithCount = categories.map(category => ({
            name: category,
            count: this.hackathons.filter(h => h.category === category).length
        }));
        
        this.logAction('Categories', categoriesWithCount);
        return categoriesWithCount;
    }

    async getStatuses() {
        const statuses = [
            { name: 'upcoming', label: 'Предстоящие' },
            { name: 'ongoing', label: 'Текущие' },
            { name: 'completed', label: 'Завершенные' }
        ];
        
        return statuses;
    }

    async resetToInitial() {
        this.logAction('resetToInitial');
        await this.delay(300);
        
        this.hackathons = this.generateMockHackathons();
        this.nextId = Math.max(...this.hackathons.map(h => h.id)) + 1;
        this.saveToLocalStorage();
        
        this.logAction('Data reset complete', { count: this.hackathons.length });
        return this.hackathons;
    }

    exportData() {
        return {
            hackathons: this.hackathons,
            total: this.hackathons.length,
            exportedAt: new Date().toISOString()
        };
    }

    importData(data) {
        if (!data || !Array.isArray(data.hackathons)) {
            throw new Error('Некорректный формат данных');
        }
        
        this.hackathons = data.hackathons;
        this.nextId = Math.max(...this.hackathons.map(h => h.id)) + 1;
        this.saveToLocalStorage();
        
        return this.hackathons;
    }

    async searchHackathons(query, filters = {}) {
        this.logAction('searchHackathons', { query, filters });
        await this.delay(300);
        
        let results = [...this.hackathons];
        
        if (query) {
            const search = query.toLowerCase();
            results = results.filter(h => 
                h.title.toLowerCase().includes(search) ||
                h.description.toLowerCase().includes(search) ||
                h.category.toLowerCase().includes(search) ||
                h.location.toLowerCase().includes(search) ||
                h.organizer.toLowerCase().includes(search)
            );
        }

        if (filters.category) {
            results = results.filter(h => h.category === filters.category);
        }
        
        if (filters.status) {
            results = results.filter(h => 
                this.getHackathonStatus(h.startDate, h.endDate) === filters.status
            );
        }
        
        if (filters.minPrize) {
            results = results.filter(h => h.prize >= parseInt(filters.minPrize));
        }
        
        if (filters.maxPrize) {
            results = results.filter(h => h.prize <= parseInt(filters.maxPrize));
        }
        
        this.logAction('searchHackathons results', { count: results.length });
        return results;
    }
}

const apiInstance = new HackathonAPI();

if (typeof window !== 'undefined') {
    window.HackathonAPI = apiInstance;
}

export default apiInstance;