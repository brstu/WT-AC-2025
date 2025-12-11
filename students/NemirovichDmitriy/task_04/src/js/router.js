// Модуль маршрутизации

var currentRoute = '';

// Функция навигации
function navigateTo(hash) {
    window.location.hash = hash;
}

// Парсинг hash
function parseHash(hash) {
    var result = {
        path: '',
        params: {},
        query: {}
    };
    
    // Удаляем # в начале
    hash = hash.replace('#', '');
    
    // Разделяем путь и query параметры
    var parts = hash.split('?');
    result.path = parts[0];
    
    // Парсим query параметры
    if (parts[1]) {
        var queryParts = parts[1].split('&');
        for (var i = 0; i < queryParts.length; i++) {
            var pair = queryParts[i].split('=');
            result.query[pair[0]] = decodeURIComponent(pair[1] || '');
        }
    }
    
    return result;
}

// Сопоставление маршрута
function matchRoute(path) {
    // Маршрут списка
    if (path == '/items' || path == '') {
        return { route: 'list', params: {} };
    }
    
    // Маршрут создания
    if (path == '/new') {
        return { route: 'create', params: {} };
    }
    
    // Маршрут редактирования
    var editMatch = path.match(/^\/items\/(\d+)\/edit$/);
    if (editMatch) {
        return { route: 'edit', params: { id: editMatch[1] } };
    }
    
    // Маршрут детали
    var detailMatch = path.match(/^\/items\/(\d+)$/);
    if (detailMatch) {
        return { route: 'detail', params: { id: detailMatch[1] } };
    }
    
    // По умолчанию - список
    return { route: 'list', params: {} };
}

// Обработчик изменения hash
function handleRoute() {
    var hash = window.location.hash || '#/items';
    var parsed = parseHash(hash);
    var matched = matchRoute(parsed.path);
    
    currentRoute = matched.route;
    
    showLoading();
    
    switch (matched.route) {
        case 'list':
            var searchQuery = parsed.query.search || '';
            if (searchQuery) {
                searchPlants(searchQuery, function(err, plants) {
                    if (err) {
                        showError('Ошибка загрузки');
                    } else {
                        renderPlantList(plants, searchQuery);
                    }
                });
            } else {
                getPlants(function(err, plants) {
                    if (err) {
                        showError('Ошибка загрузки');
                    } else {
                        renderPlantList(plants, '');
                    }
                });
            }
            break;
            
        case 'detail':
            getPlantById(matched.params.id, function(err, plant) {
                if (err) {
                    showError('Растение не найдено');
                } else {
                    renderPlantDetail(plant);
                }
            });
            break;
            
        case 'create':
            renderCreateForm();
            break;
            
        case 'edit':
            getPlantById(matched.params.id, function(err, plant) {
                if (err) {
                    showError('Растение не найдено');
                } else {
                    renderEditForm(plant);
                }
            });
            break;
            
        default:
            showError('Страница не найдена');
    }
}

// Инициализация роутера
function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
}
