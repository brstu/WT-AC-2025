// Router module
var routes = [];
var currentRoute = null;

export function addRoute(pattern, handler) {
    console.log('Adding route', pattern);
    routes.push({ pattern: pattern, handler: handler });
}

export function navigate(hash) {
    console.log('Navigating to', hash);
    window.location.hash = hash;
}

function matchRoute(hash) {
    console.log('Matching route', hash);
    
    if (!hash || hash === '#' || hash === '#/') {
        hash = '#/items';
    }
    
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        var pattern = route.pattern;
        
        if (pattern === hash) {
            return { handler: route.handler, params: {} };
        }
        
        if (pattern.indexOf(':id') !== -1) {
            var patternParts = pattern.split('/');
            var hashParts = hash.split('/');
            
            if (patternParts.length === hashParts.length) {
                var match = true;
                var params = {};
                
                for (var j = 0; j < patternParts.length; j++) {
                    if (patternParts[j].indexOf(':') === 0) {
                        var paramName = patternParts[j].substring(1);
                        params[paramName] = hashParts[j];
                    } else if (patternParts[j] !== hashParts[j]) {
                        match = false;
                        break;
                    }
                }
                
                if (match) {
                    return { handler: route.handler, params: params };
                }
            }
        }
    }
    
    return null;
}

function handleRoute() {
    console.log('Handle route');
    var hash = window.location.hash;
    
    var searchParams = {};
    if (hash.indexOf('?') !== -1) {
        var parts = hash.split('?');
        hash = parts[0];
        var queryString = parts[1];
        var pairs = queryString.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            searchParams[pair[0]] = decodeURIComponent(pair[1] || '');
        }
    }
    
    var match = matchRoute(hash);
    
    if (match) {
        currentRoute = match;
        match.handler(match.params, searchParams);
    } else {
        console.log('Route not found');
        document.getElementById('app').innerHTML = '<div class="error">Page not found</div>';
    }
}

export function init() {
    console.log('Router init');
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
}

export function getCurrentRoute() {
    return currentRoute;
}
