import { renderList } from './views/list.js';
import { renderDetail } from './views/detail.js';
import { renderForm } from './views/form.js';

export function router() {
  const hash = location.hash || '#/items';
  const path = hash.split('?')[0];

  const editMatch = path.match(/^#\/items\/(\d+)\/edit$/);
  if (editMatch) {
    renderForm(editMatch[1]);
    return;
  }

  const detailMatch = path.match(/^#\/items\/(\d+)$/);
  if (detailMatch) {
    renderDetail(detailMatch[1]);
    return;
  }

  if (path === '#/items') {
    renderList();
    return;
  }

  if (path === '#/new') {
    renderForm();
    return;
  }

  location.hash = '#/items';
}
