// Router
var routes = {};
var currentRoute = null;

function addRoute(path, handler) {
    routes[path] = handler;
}

function navigate(path) {
    window.location.hash = path;
}

function parseRoute(hash) {
    if (!hash || hash === '#' || hash === '#/') {
        return { path: '#/items', params: {} };
    }
    
    var parts = hash.substring(2).split('/');
    var path = '#/' + parts[0];
    var params = {};
    
    if (parts[0] === 'items' && parts[1] && parts[1] !== 'new') {
        params.id = parts[1];
        if (parts[2] === 'edit') {
            path = '#/items/:id/edit';
        } else {
            path = '#/items/:id';
        }
    } else if (parts[0] === 'new') {
        path = '#/new';
    }
    
    return { path: path, params: params };
}

function handleRoute() {
    var hash = window.location.hash;
    var route = parseRoute(hash);
    currentRoute = route;
    
    var handler = routes[route.path];
    if (handler) {
        handler(route.params);
    } else {
        navigate('#/items');
    }
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);
