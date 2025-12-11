import { initRouter } from './modules/router.js';

// Глобальные объекты для доступа из консоли (для отладки)
window.app = {
    router: {
        navigateTo: (path) => window.location.hash = `#${path}`
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем маршрутизатор
    initRouter();
    
    console.log('Приложение инициализировано!');
    console.log('Доступные маршруты:');
    console.log('- #/characters - Список персонажей');
    console.log('- #/characters/:id - Детали персонажа');
    console.log('- #/characters/:id/edit - Редактирование персонажа');
    console.log('- #/new - Создание нового персонажа');
});