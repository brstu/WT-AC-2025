import { renderCharactersList, renderCharacterDetail, renderCharacterForm } from './views.js';

// Маршруты приложения
const routes = {
    '/characters': {
        title: 'Список персонажей',
        handler: () => renderCharactersList()
    },
    '/characters/:id': {
        title: 'Детали персонажа',
        handler: (params) => renderCharacterDetail(params.id)
    },
    '/characters/:id/edit': {
        title: 'Редактирование персонажа',
        handler: (params) => renderCharacterForm(params.id)
    },
    '/new': {
        title: 'Создание персонажа',
        handler: () => renderCharacterForm()
    }
};

// Текущий маршрут
let currentRoute = null;

/**
 * Инициализирует маршрутизатор
 */
export function initRouter() {
    // Обработчик изменения hash
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('load', handleRouteChange);
    
    // Навешиваем обработчики навигации
    setupNavigation();
}

/**
 * Обрабатывает изменение маршрута
 */
function handleRouteChange() {
    const hash = window.location.hash.substring(1) || '/characters';
    const route = matchRoute(hash);
    
    if (route) {
        currentRoute = route;
        document.title = `${route.title} | Справочник персонажей`;
        updateNavigation(route.path);
        route.handler(route.params);
    } else {
        // Если маршрут не найден, перенаправляем на список
        window.location.hash = '#/characters';
    }
}

/**
 * Сопоставляет URL с маршрутом
 */
function matchRoute(hash) {
    // Убираем начальный и конечный слэши
    const path = hash.replace(/^\/|\/$/g, '');
    
    for (const routePattern in routes) {
        const pattern = routePattern.replace(/^\/|\/$/g, '');
        const paramNames = [];
        const regexPattern = pattern.replace(/:[^/]+/g, (match) => {
            paramNames.push(match.substring(1));
            return '([^/]+)';
        });
        
        const regex = new RegExp(`^${regexPattern}$`);
        const match = path.match(regex);
        
        if (match) {
            const params = {};
            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });
            
            return {
                path: routePattern,
                title: routes[routePattern].title,
                handler: routes[routePattern].handler,
                params
            };
        }
    }
    
    return null;
}

/**
 * Настраивает навигацию
 */
function setupNavigation() {
    // Обновляем активные ссылки при изменении hash
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1) || '/characters';
        updateNavigation(hash);
    });
}

/**
 * Обновляет активные ссылки в навигации
 */
function updateNavigation(currentPath) {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href').substring(1);
        const isActive = currentPath === href || 
                        (href === '/characters' && currentPath === '') ||
                        currentPath.startsWith(href + '/');
        
        if (isActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Навигация по программе
 */
export function navigateTo(path) {
    window.location.hash = `#${path}`;
}

/**
 * Получает текущий маршрут
 */
export function getCurrentRoute() {
    return currentRoute;
}

/**
 * Получает параметры из hash
 */
export function getHashParams() {
    const hash = window.location.hash.substring(1);
    const params = {};
    
    if (hash.includes('?')) {
        const [path, query] = hash.split('?');
        const searchParams = new URLSearchParams(query);
        
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
    }
    
    return params;
}

/**
 * Устанавливает параметры в hash
 */
export function setHashParams(params) {
    const currentHash = window.location.hash.substring(1);
    const [path] = currentHash.split('?');
    const searchParams = new URLSearchParams(params);
    
    window.location.hash = `#${path}?${searchParams.toString()}`;
}