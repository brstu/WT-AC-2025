import { listView } from './views/listView.js';
import { detailView } from './views/detailView.js';
import { editView } from './views/editView.js';
import { notFoundView } from './views/notFoundView.js';

const routes = {
  'items': listView,
  'items/:id/edit': editView,
  'items/:id': detailView,
  'new': () => editView(null),
  '': () => listView()
};

function matchRoute(hash) {
  const path = hash.replace('#/', '').split('?')[0];
  for (const pattern in routes) {
    const regex = new RegExp('^' + pattern.replace(/:\w+/g, '(\\d+)') + '$');
    const match = path.match(regex);
    if (match) {
      const params = match.slice(1);
      const query = Object.fromEntries(new URLSearchParams(location.hash.split('?')[1] || ''));
      return { handler: routes[pattern], params, query };
    }
  }
  return { handler: notFoundView };
}

export const router = {
  async navigate() {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="loading">Загрузка...</div>';
    
    const { handler, params, query } = matchRoute(location.hash || '#/items');
    
    try {
      await handler({ params, query, app });
    } catch (err) {
      app.innerHTML = `<div class="error">Ошибка: ${err.message}</div>`;
    }
  }
};