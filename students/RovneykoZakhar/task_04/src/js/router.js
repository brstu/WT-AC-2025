export default class Router {
    constructor() {
        this.routes = [];
        this.searchParams = {};
    }
    
    addRoute(pattern, handler) {
        this.routes.push({
            pattern: this._parsePattern(pattern),
            handler
        });
    }
    
    _parsePattern(pattern) {
        // Преобразуем шаблон маршрута в регулярное выражение
        const regexPattern = pattern
            .replace(/:([^\/]+)/g, '(?<$1>[^\/]+)')
            .replace(/\//g, '\\/');
        
        return new RegExp(`^${regexPattern}$`);
    }
    
    init() {
        // Обработчик изменения hash
        window.addEventListener('hashchange', () => this._handleRoute());
        
        // Обработчик загрузки страницы
        window.addEventListener('load', () => this._handleRoute());
    }
    
    _handleRoute() {
        const hash = window.location.hash || '#/comics';
        const [path, queryString] = hash.split('?');
        
        // Извлекаем параметры поиска
        if (queryString) {
            this.searchParams = Object.fromEntries(new URLSearchParams(queryString));
        } else {
            this.searchParams = {};
        }
        
        // Ищем подходящий маршрут
        for (const route of this.routes) {
            const match = path.match(route.pattern);
            
            if (match) {
                this.currentRoute = path;
                const params = match.groups || {};
                route.handler(params);
                return;
            }
        }
        
        // Если маршрут не найден, перенаправляем на список комиксов
        this.navigateTo('#/comics');
    }
    
    navigateTo(path) {
        window.location.hash = path;
    }
    
    getSearchParams() {
        return this.searchParams;
    }
    
    updateSearchParams(params) {
        // Обновляем параметры поиска без перезагрузки страницы
        const currentPath = window.location.hash.split('?')[0];
        const searchParams = new URLSearchParams(params);
        const queryString = searchParams.toString();
        
        const newHash = queryString ? `${currentPath}?${queryString}` : currentPath;
        
        // Обновляем URL без вызова события hashchange
        const oldHashChange = window.onhashchange;
        window.onhashchange = null;
        window.location.hash = newHash;
        window.onhashchange = oldHashChange;
        
        // Обновляем локальные параметры
        this.searchParams = params;
    }
}