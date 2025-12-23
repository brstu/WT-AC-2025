export class Router {
  constructor(routes) {
    this.routes = routes;
    this.app = document.getElementById('app');
    window.addEventListener('hashchange', () => this.resolve());
    window.addEventListener('load', () => this.resolve());
  }

  resolve() {
    const hash = location.hash.slice(1) || '/vacancies';
    let route = this.routes.find(r => {
      const match = hash.match(r.pattern);
      if (match) {
        r.params = match.groups || {};
        return true;
      }
    });
    if (!route) route = this.routes.find(r => r.path === '/notfound');
    this.app.innerHTML = '';
    route.view(r.params);
  }

  navigate(path) {
    location.hash = path;
  }
}