const routes = [];

export function route(path, handler) {
    routes.push({ path, handler });
}

function match(pathname, routePath) {
    const pa = pathname.split('/');
    const ra = routePath.split('/');
    if (pa.length !== ra.length) return null;
    
    const params = {};
    for (let i = 0; i < ra.length; i++) {
        if (ra[i].startsWith(':')) {
            params[ra[i].slice(1)] = decodeURIComponent(pa[i]);
        } else if (ra[i] !== pa[i]) {
            return null;
        }
    }
    return params;
}

export function navigate() {
    // Получаем хеш, убираем #, и отсекаем query params (?q=...) для матчинга пути
    const hash = location.hash.slice(1) || '/items';
    const [pathname] = hash.split('?');

    for (const r of routes) {
        const params = match(pathname, r.path);
        if (params) {
            r.handler({ params });
            return;
        }
    }
    document.getElementById('app').innerHTML = '<h1>404: Страница не найдена</h1>';
}