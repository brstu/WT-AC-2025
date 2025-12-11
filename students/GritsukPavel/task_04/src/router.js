var routes = [];
var currentRoute = null;

function addRoute(path, handler) {
    console.log('Adding route:', path);
    routes.push({ path: path, handler: handler });
}

function navigate(path) {
    console.log('Navigating to:', path);
    window.location.hash = path;
}

function matchRoute(path) {
    console.log('Matching route for:', path);
    
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        
        if (route.path === path) {
            console.log('Exact match found:', route.path);
            return { handler: route.handler, params: {} };
        }
        
        var routeParts = route.path.split('/');
        var pathParts = path.split('/');
        
        if (routeParts.length !== pathParts.length) {
            continue;
        }
        
        var params = {};
        var match = true;
        
        for (var j = 0; j < routeParts.length; j++) {
            if (routeParts[j].startsWith(':')) {
                var paramName = routeParts[j].substring(1);
                params[paramName] = pathParts[j];
            } else if (routeParts[j] !== pathParts[j]) {
                match = false;
                break;
            }
        }
        
        if (match) {
            console.log('Parametric match found:', route.path, 'params:', params);
            return { handler: route.handler, params: params };
        }
    }
    
    console.log('No route matched');
    return null;
}

function handleRouteChange() {
    var hash = window.location.hash.substring(1) || '/items';
    console.log('Route changed to:', hash);
    
    var match = matchRoute(hash);
    
    if (match) {
        currentRoute = hash;
        match.handler(match.params);
    } else {
        console.log('Route not found, redirecting to /items');
        navigate('/items');
    }
}

function initRouter() {
    console.log('Initializing router...');
    
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('load', handleRouteChange);
    
    if (!window.location.hash) {
        navigate('/items');
    }
}
