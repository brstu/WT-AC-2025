import { renderItems, renderItemDetail, renderItemNew, renderItemEdit } from './views/utils.js';

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

function getQueryParams() {
    const hash = location.hash.slice(1);
    const [path, query] = hash.split('?');
    const params = {};
    
    if (query) {
        query.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
    }
    
    return params;
}

async function navigate() {
    const app = document.getElementById('app');
    const hash = location.hash.slice(1) || '/items';
    const [pathname] = hash.split('?');
    
    try {
        app.innerHTML = '<div class="loading">Загрузка...</div>';
        
        for (const route of routes) {
            const params = match(pathname, route.path);
            if (params) {
                const queryParams = getQueryParams();
                await route.handler({ params, query: queryParams });
                return;
            }
        }
        
        app.innerHTML = `
            <div class="error">
                <h2>404 - Страница не найдена</h2>
                <p>Запрошенная страница не существует.</p>
                <a href="#/items" class="btn btn-primary">Вернуться к списку</a>
            </div>
        `;
    } catch (error) {
        console.error('Navigation error:', error);
        app.innerHTML = `
            <div class="error">
                <h2>Ошибка</h2>
                <p>${error.message}</p>
                <a href="#/items" class="btn btn-primary">Вернуться к списку</a>
            </div>
        `;
    }
}

export function initRouter() {
    route('/items', async ({ query }) => {
        const page = parseInt(query.page) || 1;
        await renderItems({ page });
    });
    route('/items/:id', renderItemDetail);
    route('/new', renderItemNew);
    route('/items/:id/edit', renderItemEdit);
    
    window.addEventListener('hashchange', navigate);
    window.addEventListener('load', navigate);
}

export function navigateTo(path) {
    location.hash = path;
}

export function updateQueryParams(params) {
    const currentHash = location.hash.slice(1);
    const [path] = currentHash.split('?');
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
    });
    
    const queryString = searchParams.toString();
    location.hash = queryString ? `${path}?${queryString}` : path;
}