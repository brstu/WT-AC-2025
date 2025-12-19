import { listView, detailView, formView, authView, loginView, registerView } from './views.js';

const routes = [];

function route(path, handler) {
  routes.push({ path, handler });
}

function parseHash() {
  const hash = location.hash.slice(1) || '/destinations';
  const [pathname, queryString] = hash.split('?');
  const query = new URLSearchParams(queryString);
  return { pathname, query };
}

function match(pathname, routePath) {
  const pa = pathname.split('/');
  const ra = routePath.split('/');
  if (pa.length !== ra.length) return null;
  const params = {};
  for (let i = 0; i < ra.length; i++) {
    if (ra[i].startsWith(':')) params[ra[i].slice(1)] = decodeURIComponent(pa[i]);
    else if (ra[i] !== pa[i]) return null;
  }
  return params;
}

export function navigate() {
  const { pathname, query } = parseHash();
  for (const r of routes) {
    const params = match(pathname, r.path);
    if (params) return r.handler({ params, query });
  }
  document.getElementById('app').innerHTML = '<h1>404 Not Found</h1>';
}

// Make navigate available globally for views that call it
window.navigate = navigate;

// Регистрация маршрутов
route('/destinations', listView);
route('/destinations/:id', detailView);
route('/new', formView);
route('/destinations/:id/edit', ({ params }) => formView({ params, isEdit: true }));
route('/login', loginView);
route('/auth', authView);  /* Новый: Выбор вход/регистрация */
route('/register', registerView);  /* Новый: Форма регистрации */

window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);