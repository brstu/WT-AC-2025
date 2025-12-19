// API модуль для работы с музеями
const MuseumAPI = (function() {
    // Базовый URL API (используем JSON Server для имитации REST API)
    const BASE_URL = 'http://localhost:3000/museums';
    
    // Для демонстрации, если JSON Server не запущен, используем localStorage
    const USE_LOCAL_STORAGE = true;
    const STORAGE_KEY = 'museums_app_data';
    
    // Инициализация тестовых данных, если их нет
    const initializeTestData = () => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            const testMuseums = [
                {
                    id: 1,
                    name: "Государственный Эрмитаж",
                    city: "Санкт-Петербург",
                    address: "Дворцовая пл., 2",
                    description: "Один из крупнейших и самых значительных художественных и культурно-исторических музеев России и мира.",
                    category: "Искусство",
                    founded: 1764,
                    website: "https://www.hermitagemuseum.org",
                    visited: true,
                    visitDate: "2022-07-15",
                    rating: 5
                },
                {
                    id: 2,
                    name: "Государственная Третьяковская галерея",
                    city: "Москва",
                    address: "Лаврушинский пер., 10",
                    description: "Художественный музей в Москве, основанный в 1856 году купцом Павлом Третьяковым.",
                    category: "Искусство",
                    founded: 1856,
                    website: "https://www.tretyakovgallery.ru",
                    visited: true,
                    visitDate: "2023-01-20",
                    rating: 5
                },
                {
                    id: 3,
                    name: "Музей космонавтики",
                    city: "Москва",
                    address: "пр-т Мира, 111",
                    description: "Музей, посвящённый истории космонавтики, расположенный в основании монумента «Покорителям космоса».",
                    category: "Наука и техника",
                    founded: 1981,
                    website: "https://www.kosmo-museum.ru",
                    visited: false,
                    visitDate: null,
                    rating: null
                },
                {
                    id: 4,
                    name: "Русский музей",
                    city: "Санкт-Петербург",
                    address: "ул. Инженерная, 4",
                    description: "Крупнейший музей русского искусства в мире, открытый в 1895 году по указу императора Николая II.",
                    category: "Искусство",
                    founded: 1895,
                    website: "https://www.rusmuseum.ru",
                    visited: true,
                    visitDate: "2021-09-10",
                    rating: 4
                },
                {
                    id: 5,
                    name: "Политехнический музей",
                    city: "Москва",
                    address: "площадь Революции, 2/3",
                    description: "Один из старейших научно-технических музеев мира, основанный в 1872 году.",
                    category: "Наука и техника",
                    founded: 1872,
                    website: "https://polymus.ru",
                    visited: false,
                    visitDate: null,
                    rating: null
                }
            ];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(testMuseums));
        }
    };
    
    // Получить все музеи из localStorage
    const getMuseumsFromStorage = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    };
    
    // Сохранить музеи в localStorage
    const saveMuseumsToStorage = (museums) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(museums));
    };
    
    // Генерация нового ID
    const generateId = () => {
        const museums = getMuseumsFromStorage();
        const maxId = museums.length > 0 ? Math.max(...museums.map(m => m.id)) : 0;
        return maxId + 1;
    };
    
    // Имитация задержки сети
    const simulateNetworkDelay = () => {
        return new Promise(resolve => {
            setTimeout(resolve, Math.random() * 300 + 200);
        });
    };
    
    // Обработка ошибок
    const handleError = (error) => {
        console.error('API Error:', error);
        throw new Error('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
    };
    
    // Получить все музеи
    const getAllMuseums = async () => {
        try {
            await simulateNetworkDelay();
            
            if (USE_LOCAL_STORAGE) {
                initializeTestData();
                return getMuseumsFromStorage();
            } else {
                const response = await fetch(BASE_URL);
                if (!response.ok) throw new Error('Ошибка сети');
                return await response.json();
            }
        } catch (error) {
            return handleError(error);
        }
    };
    
    // Получить музей по ID
const getMuseumById = async (id) => {
    try {
        await simulateNetworkDelay();
        
        if (USE_LOCAL_STORAGE) {
            const museums = getMuseumsFromStorage();
            // Преобразуем id в число для корректного сравнения
            const museumId = parseInt(id);
            const museum = museums.find(m => m.id === museumId);
            
            if (!museum) {
                throw new Error(`Музей с ID ${id} не найден`);
            }
            
            return museum;
        } else {
            const response = await fetch(`${BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Ошибка сети');
            return await response.json();
        }
    } catch (error) {
        console.error('Error in getMuseumById:', error);
        throw error; // Важно передать ошибку дальше
    }
};
    
    // Создать новый музей
    const createMuseum = async (museumData) => {
        try {
            await simulateNetworkDelay();
            
            if (USE_LOCAL_STORAGE) {
                const museums = getMuseumsFromStorage();
                const newMuseum = {
                    ...museumData,
                    id: generateId(),
                    visited: museumData.visited === 'true',
                    rating: museumData.rating ? parseInt(museumData.rating) : null
                };
                
                museums.push(newMuseum);
                saveMuseumsToStorage(museums);
                return newMuseum;
            } else {
                const response = await fetch(BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(museumData)
                });
                
                if (!response.ok) throw new Error('Ошибка сети');
                return await response.json();
            }
        } catch (error) {
            return handleError(error);
        }
    };
    
    // Обновить музей
const updateMuseum = async (id, museumData) => {
    try {
        await simulateNetworkDelay();
        
        if (USE_LOCAL_STORAGE) {
            const museums = getMuseumsFromStorage();
            const museumId = parseInt(id); // Преобразуем ID
            const index = museums.findIndex(m => m.id === museumId);
            
            if (index === -1) throw new Error('Музей не найден');
            
            museums[index] = {
                ...museums[index],
                ...museumData,
                id: museumId, // Используем преобразованный ID
                visited: museumData.visited === 'true',
                rating: museumData.rating ? parseInt(museumData.rating) : null
            };
            
            saveMuseumsToStorage(museums);
            return museums[index];
        } else {
            // ... остальной код без изменений
        }
    } catch (error) {
        return handleError(error);
    }
};

// Обновить статус посещения музея
const updateVisitStatus = async (id, visited, visitDate = null, rating = null) => {
    try {
        await simulateNetworkDelay();
        
        if (USE_LOCAL_STORAGE) {
            const museums = getMuseumsFromStorage();
            const museumId = parseInt(id); // Преобразуем ID
            const index = museums.findIndex(m => m.id === museumId);
            
            if (index === -1) throw new Error('Музей не найден');
            
            museums[index] = {
                ...museums[index],
                visited: visited === 'true',
                visitDate: visited ? visitDate : null,
                rating: visited ? rating : null
            };
            
            saveMuseumsToStorage(museums);
            return museums[index];
        } else {
            // ... остальной код без изменений
        }
    } catch (error) {
        return handleError(error);
    }
};

// Удалить музей
const deleteMuseum = async (id) => {
    try {
        await simulateNetworkDelay();
        
        if (USE_LOCAL_STORAGE) {
            const museums = getMuseumsFromStorage();
            const museumId = parseInt(id); // Преобразуем ID
            const filteredMuseums = museums.filter(m => m.id !== museumId);
            
            if (museums.length === filteredMuseums.length) {
                throw new Error('Музей не найден');
            }
            
            saveMuseumsToStorage(filteredMuseums);
            return { success: true };
        } else {
            // ... остальной код без изменений
        }
    } catch (error) {
        return handleError(error);
    }
};
    
    // Поиск музеев
    const searchMuseums = async (query) => {
        try {
            await simulateNetworkDelay();
            
            const museums = await getAllMuseums();
            
            if (!query) return museums;
            
            const lowercaseQuery = query.toLowerCase();
            return museums.filter(museum => 
                museum.name.toLowerCase().includes(lowercaseQuery) ||
                museum.city.toLowerCase().includes(lowercaseQuery) ||
                museum.description.toLowerCase().includes(lowercaseQuery) ||
                museum.category.toLowerCase().includes(lowercaseQuery)
            );
        } catch (error) {
            return handleError(error);
        }
    };
    
    return {
        getAllMuseums,
        getMuseumById,
        createMuseum,
        updateMuseum,
        updateVisitStatus,
        deleteMuseum,
        searchMuseums
    };
})();