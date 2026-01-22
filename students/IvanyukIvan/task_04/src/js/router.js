// Маршрутизатор на основе hashchange/load
const Router = (function() {
    let routes = [];
    let currentRoute = null;
    let currentParams = {};
    let currentQuery = {};
    
    // Добавление маршрута
    const addRoute = (path, handler) => {
        // Преобразование пути в регулярное выражение
        const regexPath = path
            .replace(/\//g, '\\/')
            .replace(/:\w+/g, '([^\\/]+)');
        
        routes.push({
            pattern: new RegExp(`^${regexPath}$`),
            originalPath: path,
            handler
        });
    };
    
    // Определение текущего маршрута с разделением на путь и параметры
    const getCurrentRoute = () => {
        let hash = window.location.hash.substring(1) || '/';
        
        // Разделяем путь и параметры запроса
        const [path, queryString] = hash.split('?');
        
        // Парсим параметры запроса
        if (queryString) {
            const params = new URLSearchParams(queryString);
            currentQuery = Object.fromEntries(params.entries());
        } else {
            currentQuery = {};
        }
        
        return path || '/';
    };
    
    // Парсинг параметров запроса из hash
    const parseQueryParams = (hash) => {
        const queryStart = hash.indexOf('?');
        if (queryStart === -1) return {};
        
        const queryString = hash.substring(queryStart + 1);
        const params = new URLSearchParams(queryString);
        return Object.fromEntries(params.entries());
    };
    
    // Сопоставление маршрута с зарегистрированными путями
    const matchRoute = (path) => {
        for (const route of routes) {
            const match = path.match(route.pattern);
            if (match) {
                // Извлечение параметров из пути
                const paramNames = [...route.originalPath.matchAll(/:(\w+)/g)].map(match => match[1]);
                const params = {};
                
                paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });
                
                return {
                    handler: route.handler,
                    params
                };
            }
        }
        
        return null;
    };
    
    // Навигация по hash
    const navigate = (path) => {
        window.location.hash = path;
    };
    
    // Обработчик изменения hash
    const handleHashChange = () => {
        const fullHash = window.location.hash.substring(1) || '/';
        
        // Разделяем путь и параметры запроса
        const [path, queryString] = fullHash.split('?');
        const routePath = path || '/';
        
        // Обновляем параметры запроса
        if (queryString) {
            const params = new URLSearchParams(queryString);
            currentQuery = Object.fromEntries(params.entries());
        } else {
            currentQuery = {};
        }
        
        const matched = matchRoute(routePath);
        
        if (matched) {
            currentRoute = matched.handler;
            currentParams = matched.params;
            matched.handler(matched.params);
        } else {
            // Если маршрут не найден, показываем 404
            currentRoute = null;
            showNotFound();
        }
        
        // Обновление активной ссылки в навигации
        updateActiveLink();
    };
    
    // Показ страницы 404
    const showNotFound = () => {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Страница не найдена</h2>
                <p>Запрашиваемая страница не существует.</p>
                <a href="#/items" class="btn btn-primary">Вернуться к списку музеев</a>
            </div>
        `;
    };
    
    // Обновление активной ссылки в навигации
    const updateActiveLink = () => {
        const navLinks = document.querySelectorAll('.nav-link');
        const fullHash = window.location.hash.substring(1) || '/';
        const [path] = fullHash.split('?');
        const currentPath = path || '/';
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            link.classList.remove('active');
            
            // Сравниваем пути без параметров запроса
            if (currentPath === href || 
                (href === '/' && currentPath === '') ||
                (href === '' && currentPath === '/')) {
                link.classList.add('active');
            }
        });
    };
    
    // Получить параметры запроса
    const getQueryParams = () => {
        return currentQuery;
    };
    
    // Обновить параметры запроса
    const updateQueryParams = (params) => {
        const fullHash = window.location.hash.substring(1) || '/';
        const [path] = fullHash.split('?');
        
        const queryString = new URLSearchParams(params).toString();
        const newHash = queryString ? `${path}?${queryString}` : path;
        
        navigate(newHash);
    };
    
    // Инициализация роутера
    const init = () => {
        // Обработка события изменения hash
        window.addEventListener('hashchange', handleHashChange);
        
        // Обработка события загрузки страницы
        window.addEventListener('load', handleHashChange);
        
        // Перенаправление с корня на список музеев
        if (window.location.hash === '' || window.location.hash === '#/' || window.location.hash === '#') {
            navigate('#/items');
        }
    };
    
    return {
        addRoute,
        navigate,
        init,
        getCurrentParams: () => currentParams,
        getCurrentRoute: () => currentRoute,
        getQueryParams,
        updateQueryParams
    };
})();