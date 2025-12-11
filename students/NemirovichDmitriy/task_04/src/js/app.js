// Главный модуль приложения

var appState = {
    initialized: false,
    currentPage: null,
    data: null
};

// Функция инициализации
function initApp() {
    console.log('Инициализация приложения...');
    
    // Инициализируем views
    initViews();
    
    // Инициализируем роутер
    initRouter();
    
    // Загружаем начальные данные
    getPlants(function(err, plants) {
        if (err) {
            console.error('Ошибка загрузки данных:', err);
        } else {
            console.log('Данные загружены:', plants.length, 'растений');
        }
    });
    
    appState.initialized = true;
    console.log('Приложение инициализировано');
}

// Запуск приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);

// Вспомогательные функции
function formatDate(date) {
    var d = new Date(date);
    return d.toLocaleDateString('ru-RU');
}

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

function debugInfo() {
    console.log('App State:', appState);
    console.log('Current Route:', currentRoute);
    console.log('Plants Data:', plantsData);
}
