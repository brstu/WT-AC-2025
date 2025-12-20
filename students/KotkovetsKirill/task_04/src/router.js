// Router модуль - маршрутизация

var routes = {
    '/items': showListPage,
    '/items/:id': showDetailPage,
    '/items/:id/edit': showEditPage,
    '/new': showNewPage
};

function parseHash() {
    var hash = window.location.hash || '#/items';
    hash = hash.substring(1); // убираем #
    
    // Проверяем параметры поиска
    var queryIndex = hash.indexOf('?');
    var path = hash;
    var query = '';
    if (queryIndex !== -1) {
        path = hash.substring(0, queryIndex);
        query = hash.substring(queryIndex + 1);
    }
    
    return { path: path, query: query };
}

function getQueryParam(queryString, param) {
    var params = queryString.split('&');
    for (var i = 0; i < params.length; i++) {
        var pair = params[i].split('=');
        if (pair[0] === param) {
            return decodeURIComponent(pair[1] || '');
        }
    }
    return '';
}

function matchRoute(path) {
    // Проверяем точные совпадения
    if (path === '/items' || path === '') {
        return { handler: showListPage, params: {} };
    }
    if (path === '/new') {
        return { handler: showNewPage, params: {} };
    }
    
    // Проверяем /items/:id/edit
    var editMatch = path.match(/^\/items\/(\d+)\/edit$/);
    if (editMatch) {
        return { handler: showEditPage, params: { id: editMatch[1] } };
    }
    
    // Проверяем /items/:id
    var detailMatch = path.match(/^\/items\/(\d+)$/);
    if (detailMatch) {
        return { handler: showDetailPage, params: { id: detailMatch[1] } };
    }
    
    return null;
}

function handleRoute() {
    var parsed = parseHash();
    var route = matchRoute(parsed.path);
    
    if (route) {
        route.handler(route.params, parsed.query);
    } else {
        // Страница не найдена - редирект на список
        navigateTo('#/items');
    }
}

function navigateTo(hash) {
    window.location.hash = hash;
}

// Инициализация роутера
function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
}
