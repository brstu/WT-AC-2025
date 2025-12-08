/**
 * Класс для работы с хеш-роутингом в SPA
 */
export class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.params = {};
        
        // Обрабатываем изменения хеша
        window.addEventListener('hashchange', () => this.handleRoute());
        // Обрабатываем первую загрузку
        window.addEventListener('load', () => this.handleRoute());
    }

    /**
     * Регистрация маршрута
     * @param {string} path - Путь с поддержкой параметров (например: /items/:id)
     * @param {Function} handler - Функция-обработчик маршрута
     */
    addRoute(path, handler) {
        this.routes.push({
            path,
            handler,
            regex: this.pathToRegex(path)
        });
    }

    /**
     * Преобразование пути в регулярное выражение
     * @param {string} path - Путь маршрута
     * @returns {RegExp} Регулярное выражение для проверки
     */
    pathToRegex(path) {
        // Преобразуем :param в именованные группы
        const pattern = path
            .replace(/\//g, '\\/')
            .replace(/:(\w+)/g, '(?<$1>[^/]+)');
        return new RegExp(`^${pattern}$`);
    }

    /**
     * Обработка текущего маршрута
     */
    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        
        for (const route of this.routes) {
            const match = hash.match(route.regex);
            if (match) {
                this.currentRoute = route;
                this.params = match.groups || {};
                
                try {
                    await route.handler(this.params);
                } catch (error) {
                    console.error('Ошибка при обработке маршрута:', error);
                    this.navigate('/error');
                }
                return;
            }
        }

        // Маршрут не найден
        this.navigate('/');
    }

    /**
     * Программная навигация
     * @param {string} path - Путь для перехода
     */
    navigate(path) {
        window.location.hash = path;
    }

    /**
     * Возврат назад
     */
    back() {
        window.history.back();
    }

    /**
     * Получить текущий путь
     * @returns {string} Текущий путь без #
     */
    getCurrentPath() {
        return window.location.hash.slice(1) || '/';
    }

    /**
     * Получить параметры текущего маршрута
     * @returns {Object} Объект с параметрами
     */
    getParams() {
        return { ...this.params };
    }
}
