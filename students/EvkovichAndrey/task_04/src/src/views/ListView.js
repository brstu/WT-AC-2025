import { api } from '../api.js';
import {emptyHTML, errorHTML, loadingHTML} from "./components/Loading.js";
import {showNotification} from "./components/Notification.js";

export class ListView {
    async render() {
        const content = document.getElementById('content');
        content.innerHTML = `
      <div class="search">
        <input type="text" id="search" placeholder="Поиск по названию..." value="${this.getSearchFromHash()}">
        <button id="search-btn">Найти</button>
      </div>
      ${loadingHTML}
    `;

        const urlParams = new URLSearchParams(location.hash.split('?')[1] || '');
        const search = urlParams.get('q') || '';

        try {
            const items = await api.getList(search ? `title_like=${search}` : '');

            const listHTML = items.length
                ? `<ul class="items-list">
            ${items.map(item => `
              <li>
                <strong>${item.title}</strong><br>
                <small>Автор: ${item.body.slice(0,50)}...</small><br>
                <a href="#/items/${item.id}">Подробнее</a> |
                <a href="#/items/${item.id}/edit">Редактировать</a> |
                <button class="delete-btn" data-id="${item.id}">Удалить</button>
              </li>`).join('')}
           </ul>`
                : emptyHTML;

            content.innerHTML = `
        <div class="search">
          <input type="text" id="search" placeholder="Поиск..." value="${search}">
          <button id="search-btn">Найти</button>
        </div>
        ${listHTML}
      `;

            // Обработчики
            document.getElementById('search-btn')?.addEventListener('click', () => this.search());
            document.getElementById('search')?.addEventListener('keypress', e => e.key === 'Enter' && this.search());

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (!confirm('Удалить серию?')) return;
                    const id = e.target.dataset.id;
                    try {
                        await api.delete(id);
                        showNotification('Серия удалена');
                        await this.render();
                    } catch (err) {
                        showNotification(err.message, 'error');
                    }
                });
            });

        } catch (err) {
            content.innerHTML = errorHTML(err.message);
        }
    }

    getSearchFromHash() {
        const params = new URLSearchParams(location.hash.split('?')[1] || '');
        return params.get('q') || '';
    }

    search() {
        const q = document.getElementById('search').value.trim();
        location.hash = `#/items${q ? '?q=' + encodeURIComponent(q) : ''}`;
    }
}