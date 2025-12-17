// Модуль маршрутизатора
export class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentRoute = null;
        this.params = {};
        this.queryParams = {};
        
        // Привязываем контекст для обработчиков событий
        this.handleHashChange = this.handleHashChange.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        
        // Инициализация роутера
        this.init();
    }
    
    init() {
        // Навешиваем обработчики событий
        window.addEventListener('hashchange', this.handleHashChange);
        window.addEventListener('load', this.handleLoad);
    }
    
    handleHashChange() {
        this.handleRoute();
    }
    
    handleLoad() {
        this.handleRoute();
    }
    
    handleRoute() {
        const fullHash = window.location.hash.substring(1) || '/books';
        // Разделяем путь и параметры запроса
        const [path, queryString] = fullHash.split('?');
        const hash = path || '/books';
        
        // Парсим параметры запроса
        this.queryParams = {};
        if (queryString) {
            const params = new URLSearchParams(queryString);
            for (const [key, value] of params) {
                this.queryParams[key] = decodeURIComponent(value);
            }
        }
        
        // Находим подходящий маршрут
        const route = this.findRoute(hash);
        
        if (route) {
            this.currentRoute = route;
            // Вызываем колбэк маршрута с параметрами
            route.callback(this.params, this.queryParams);
        } else {
            // Если маршрут не найден - редирект на список книг
            window.location.hash = '/books';
        }
    }
    
    findRoute(hash) {
        // Сбрасываем параметры пути
        this.params = {};
        
        // Проверяем каждый маршрут
        for (const route of this.routes) {
            const match = this.matchRoute(route.path, hash);
            if (match) {
                return route;
            }
        }
        
        return null;
    }
    
    matchRoute(routePath, hash) {
        // Преобразуем путь маршрута в регулярное выражение
        const routeParts = routePath.split('/');
        const hashParts = hash.split('/');
        
        // Если количество частей не совпадает
        if (routeParts.length !== hashParts.length) {
            return false;
        }
        
        // Проверяем каждую часть
        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const hashPart = hashParts[i];
            
            // Если часть маршрута является параметром (начинается с :)
            if (routePart.startsWith(':')) {
                const paramName = routePart.substring(1);
                this.params[paramName] = hashPart;
            } 
            // Иначе проверяем на точное совпадение
            else if (routePart !== hashPart) {
                return false;
            }
        }
        
        return true;
    }
    
    navigateTo(path, queryParams = {}) {
        let url = path;
        
        // Добавляем параметры запроса, если они есть
        if (Object.keys(queryParams).length > 0) {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(queryParams)) {
                if (value) {
                    params.append(key, encodeURIComponent(value));
                }
            }
            url += '?' + params.toString();
        }
        
        window.location.hash = url;
    }
    
    getCurrentPath() {
        return window.location.hash.substring(1);
    }
    
    // Статический метод для создания экземпляра роутера
    static create(routes) {
        return new Router(routes);
    }
}