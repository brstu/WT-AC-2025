// Router module для обработки маршрутов

// Переменные для маршрутизации
var routes = [];
var currentRoute = null;

// Инициализация роутера
function initRouter() {
    // Определение роутов приложения
    routes = [
        {
            path: '#/items',
            handler: function() {
                showLoading();
                API.getItems().then(items => {
                    renderItemsList(items);
                });
            }
        },
        {
            path: '#/items/:id',
            handler: function(id) {
                renderItemDetail(id);
            }
        },
        {
            path: '#/new',
            handler: function() {
                renderCreateForm();
            }
        },
        {
            path: '#/items/:id/edit',
            handler: function(id) {
                renderEditForm(id);
            }
        }
    ];
    
    // Обработчики событий
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
}

// Обработка маршрута
function handleRoute() {
    var hash = window.location.hash || '#/items';
    currentRoute = hash;
    
    // Сопоставление маршрутов
    if (hash === '#/items') {
        routes[0].handler();
    } else if (hash === '#/new') {
        routes[2].handler();
    } else if (hash.includes('/edit')) {
        // Парсинг параметров маршрута
        var parts = hash.split('/');
        var id = parts[2];
        routes[3].handler(id);
    } else if (hash.startsWith('#/items/')) {
        var parts = hash.split('/');
        var id = parts[2];
        if (id) {
            routes[1].handler(id);
        }
    } else {
        // Редирект на главную
        navigateTo('#/items');
    }
}

// Навигация - глобальная функция
function navigateTo(hash) {
    window.location.hash = hash;
}
