import { Router } from './router.js';
import { listView } from './views/listView.js';
import { detailView } from './views/detailView.js';
import { editView } from './views/editView.js';
import { newView } from './views/newView.js';

export const router = new Router([
  { pattern: /^\/vacancies$/, view: listView },
  { pattern: /^\/vacancies\/(?<id>\d+)$/, view: detailView },
  { pattern: /^\/vacancies\/(?<id>\d+)\/edit$/, view: editView },
  { pattern: /^\/new$/, view: newView },
  { path: '/notfound', view: () => document.getElementById('app').innerHTML = '<h2>404</h2>' }
]);

export function showNotification(msg) {
  const notif = document.getElementById('notification');
  notif.textContent = msg;
  notif.style.display = 'block';
  setTimeout(() => notif.style.display = 'none', 3000);
}

// Перехват ссылок
document.addEventListener('click', e => {
  if (e.target.tagName === 'A' && e.target.href.includes('#/')) {
    e.preventDefault();
    router.navigate(new URL(e.target.href).hash.slice(1));
  }
});