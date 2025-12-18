// modules/api.js
import { showNotification } from './utils.js';

// Инициализация данных в localStorage
function initLocalStorage() {
    if (!localStorage.getItem('characters')) {
        const initialCharacters = [
            {
                id: 1,
                name: "Гарри Поттер",
                universe: "Гарри Поттер",
                category: "Герой",
                status: "Жив",
                gender: "Мужской",
                imageUrl: "",
                description: "Молодой волшебник, известный как Мальчик-Который-Выжил.",
                biography: "Главный герой серии романов Джоан Роулинг.",
                abilities: "Магические способности, полёты на мётлах.",
                weaknesses: "Слишком доверчив, импульсивен.",
                relationships: "Друзья: Рон Уизли и Гермиона Грейнджер.",
                createdAt: "2024-01-15T10:30:00.000Z",
                updatedAt: "2024-01-15T10:30:00.000Z"
            },
            {
                id: 2,
                name: "Шерлок Холмс",
                universe: "Шерлок Холмс",
                category: "Герой",
                status: "Жив",
                gender: "Мужской",
                imageUrl: "",
                description: "Гениальный детектив-консультант из Лондона.",
                biography: "Литературный персонаж, созданный Артуром Конан Дойлом.",
                abilities: "Дедуктивный метод, наблюдательность.",
                weaknesses: "Склонен к депрессии.",
                relationships: "Напарник: доктор Ватсон.",
                createdAt: "2024-01-16T14:20:00.000Z",
                updatedAt: "2024-01-16T14:20:00.000Z"
            }
        ];
        localStorage.setItem('characters', JSON.stringify(initialCharacters));
    }
}

// Получаем персонажей из localStorage
function getCharacters() {
    const data = localStorage.getItem('characters');
    return data ? JSON.parse(data) : [];
}

// Сохраняем персонажей в localStorage
function saveCharacters(characters) {
    localStorage.setItem('characters', JSON.stringify(characters));
}

// Инициализируем при первом запуске
initLocalStorage();

// API функции
export async function fetchCharacters(params = {}) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let characters = getCharacters();
    
    // Поиск
    if (params.search && params.search.trim()) {
        const searchLower = params.search.toLowerCase().trim();
        characters = characters.filter(char => 
            char.name.toLowerCase().includes(searchLower) ||
            (char.universe && char.universe.toLowerCase().includes(searchLower)) ||
            (char.description && char.description.toLowerCase().includes(searchLower))
        );
    }
    
    // Сортировка по дате (новые сначала)
    characters.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Пагинация
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCharacters = characters.slice(startIndex, endIndex);
    
    return {
        characters: paginatedCharacters,
        totalCount: characters.length,
        page,
        limit
    };
}

export async function fetchCharacter(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const characters = getCharacters();
    const character = characters.find(char => char.id == id);
    
    if (!character) {
        throw new Error('Персонаж не найден');
    }
    
    return character;
}

export async function createCharacter(characterData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const characters = getCharacters();
    const newId = characters.length > 0 ? Math.max(...characters.map(c => c.id)) + 1 : 1;
    
    const newCharacter = {
        id: newId,
        ...characterData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    characters.push(newCharacter);
    saveCharacters(characters);
    
    showNotification('Персонаж успешно создан!', 'success');
    return newCharacter;
}

export async function updateCharacter(id, characterData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const characters = getCharacters();
    const index = characters.findIndex(char => char.id == id);
    
    if (index === -1) {
        throw new Error('Персонаж не найден');
    }
    
    characters[index] = {
        ...characters[index],
        ...characterData,
        updatedAt: new Date().toISOString()
    };
    
    saveCharacters(characters);
    
    showNotification('Персонаж успешно обновлен!', 'success');
    return characters[index];
}

export async function deleteCharacter(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const characters = getCharacters();
    const index = characters.findIndex(char => char.id == id);
    
    if (index === -1) {
        throw new Error('Персонаж не найден');
    }
    
    characters.splice(index, 1);
    saveCharacters(characters);
    
    showNotification('Персонаж успешно удален!', 'success');
    return true;
}

export async function searchCharacters(query) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const characters = getCharacters();
    const searchLower = query.toLowerCase();
    
    return characters.filter(char => 
        char.name.toLowerCase().includes(searchLower) ||
        (char.universe && char.universe.toLowerCase().includes(searchLower))
    );
}