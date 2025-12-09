import { route } from './router.js';
import { listView, detailView, formView } from './views.js';

const html = document.documentElement;
const toggle = document.getElementById('themeToggle');

if (localStorage.getItem('theme') === 'light') html.dataset.theme = 'light';
toggle.textContent = html.dataset.theme === 'light' ? 'Тьма' : 'Свет';

toggle.addEventListener('click', () => {
  const isLight = html.dataset.theme === 'light';
  html.dataset.theme = isLight ? 'dark' : 'light';
  localStorage.setItem('theme', isLight ? 'dark' : 'light');
  toggle.textContent = isLight ? 'Свет' : 'Тьма';
});

route('/items', listView);
route('/items/:id', detailView);
route('/new', () => formView({}));
route('/items/:id/edit', params => formView(params));