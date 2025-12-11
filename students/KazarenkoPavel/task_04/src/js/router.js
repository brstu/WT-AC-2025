/**
 * Простой hash-роутер для SPA
 */
export class Router {
  constructor(routes = []) {
    this.routes = routes;
    this.currentRoute = null;
    this.params = {};
    this.query = {};
    this.init();
  }

  /**
   * Инициализация роутера
   */
  init() {
    // Обработчик изменения hash
    window.addEventListener('hashchange', () => this.handleRoute());

    // Обработчик загрузки страницы
    window.addEventListener('load', () => this.handleRoute());

    // Обработчик кликов по ссылкам с data-route
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link && link.hasAttribute('href')) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
  }

  /**
   * Добавление маршрута
   */
  addRoute(path, view, title = '') {
    this.routes.push({ path, view, title });
  }

  /**
   * Обработка текущего маршрута
   */
  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    this.parseHash(hash);

    // Поиск подходящего маршрута
    const route = this.findRoute(this.currentRoute);

    if (route) {
      // Обновление заголовка страницы
      if (route.title) {
        document.title = `${route.title} — Кулинарная книга`;
      }

      // Активация навигационных ссылок
      this.updateActiveLinks(route);

      // Вызов представления
      route.view.render(this.params, this.query);
    } else {
      // 404 - редирект на список рецептов
      this.navigate('/recipes');
    }
  }

  /**
   * Парсинг hash для извлечения параметров и query
   */
  parseHash(hash) {
    // Удаляем начальный слэш
    const cleanHash = hash.startsWith('/') ? hash.slice(1) : hash;

    // Разделяем на путь и query
    const [path, queryString] = cleanHash.split('?');

    // Сохраняем путь
    this.currentRoute = '/' + path;

    // Парсим query параметры
    this.query = {};
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key) {
          this.query[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
      });
    }

    // Парсим параметры маршрута
    this.params = this.extractParams(path);
  }

  /**
   * Извлечение параметров из пути
   */
  extractParams(path) {
    const params = {};
    const pathParts = path.split('/');

    this.routes.forEach(route => {
      const routeParts = route.path.slice(1).split('/');

      if (routeParts.length === pathParts.length) {
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) {
            const paramName = routeParts[i].slice(1);
            params[paramName] = pathParts[i];
          }
        }
      }
    });

    return params;
  }

  /**
   * Поиск маршрута по пути
   */
  findRoute(path) {
    const pathParts = path.split('/').filter(Boolean);

    return this.routes.find(route => {
      const routeParts = route.path.split('/').filter(Boolean);

      if (routeParts.length !== pathParts.length) {
        return false;
      }

      for (let i = 0; i < routeParts.length; i++) {
        if (!routeParts[i].startsWith(':') && routeParts[i] !== pathParts[i]) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Навигация по hash
   */
  navigate(path) {
    if (path.startsWith('#')) {
      window.location.hash = path;
    } else {
      window.location.hash = '#' + (path.startsWith('/') ? path : '/' + path);
    }
  }

  /**
   * Обновление активных ссылок в навигации
   */
  updateActiveLinks(route) {
    document.querySelectorAll('[data-route]').forEach(link => {
      const linkPath = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', linkPath === route.path);
    });
  }

  /**
   * Получение текущего пути
   */
  getCurrentPath() {
    return this.currentRoute;
  }

  /**
   * Получение параметров маршрута
   */
  getParams() {
    return { ...this.params };
  }

  /**
   * Получение query параметров
   */
  getQuery() {
    return { ...this.query };
  }

  /**
   * Обновление query параметров без перезагрузки страницы
   */
  updateQuery(params, replace = false) {
    const currentQuery = replace ? {} : { ...this.query };
    const newQuery = { ...currentQuery, ...params };

    // Удаляем пустые параметры
    Object.keys(newQuery).forEach(key => {
      if (newQuery[key] === '' || newQuery[key] == null) {
        delete newQuery[key];
      }
    });

    // Формируем новую строку query
    const queryString = Object.keys(newQuery)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(newQuery[key])}`)
      .join('&');

    // Обновляем hash
    const path = this.currentRoute.slice(1);
    const newHash = queryString ? `${path}?${queryString}` : path;

    this.navigate(newHash);
  }
}
