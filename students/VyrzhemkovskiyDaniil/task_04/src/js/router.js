const router = {
  routes: [],

  add(path, handler) {
    this.routes.push({ path, handler });
  },

  match(pathname, routePath) {
    const pa = pathname.split('/');
    const ra = routePath.split('/');
    if (pa.length !== ra.length) return null;

    const params = {};
    for (let i = 0; i < ra.length; i++) {
      if (ra[i].startsWith(':')) {
        params[ra[i].slice(1)] = decodeURIComponent(pa[i]);
      } else if (ra[i] !== pa[i]) return null;
    }
    return params;
  },

  getQuery() {
    const hash = location.hash.slice(1);
    const queryStr = hash.split('?')[1] || '';
    return new URLSearchParams(queryStr);
  },

  navigate() {
    const hash = location.hash.slice(1) || '/movies'; 
    const [path] = hash.split('?');

    console.log('Навигация к:', path);

    for (const r of this.routes) {
      const params = this.match(path, r.path);
      if (params) {
        console.log('Найден маршрут:', r.path, 'Параметры:', params);
        const query = this.getQuery();
        return r.handler({ params, query });
      }
    }

    console.error('Маршрут не найден:', path);
    document.getElementById('app').innerHTML = ErrorMessage('404: Страница не найдена');
  },

  init() {
    window.addEventListener('hashchange', () => this.navigate());
    window.addEventListener('load', () => this.navigate());
  }
};