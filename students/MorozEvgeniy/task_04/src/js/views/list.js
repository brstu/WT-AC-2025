import api from '../api.js';
import { renderLoader, renderError } from '../utils.js';

export async function listPage(params) {
    const app = document.getElementById('app');
    app.innerHTML = renderLoader();

    // Получаем параметр поиска из URL (?q=...)
    // hash выглядит как #/items?q=text
    const hashParts = location.hash.split('?');
    const searchParams = new URLSearchParams(hashParts[1] || '');
    const query = searchParams.get('q') || '';

    try {
        const gadgets = await api.getAll(query);
        
        const listHtml = gadgets.length 
            ? `<div class="grid">
                ${gadgets.map(g => `
                    <div class="card">
                        <h3>${g.name}</h3>
                        <p><strong>${g.brand}</strong> | $${g.price}</p>
                        <a href="#/items/${g.id}" class="btn btn-primary">Подробнее</a>
                    </div>
                `).join('')}
               </div>`
            : `<p>Список пуст.</p>`;

        app.innerHTML = `
            <h1>Каталог гаджетов</h1>
            <div class="form-group">
                <input type="text" id="search" placeholder="Поиск..." value="${query}">
            </div>
            ${listHtml}
        `;

        // Обработчик поиска
        document.getElementById('search').addEventListener('input', (e) => {
            const val = e.target.value;
            // Сохраняем фильтр в Hash
            location.hash = val ? `#/items?q=${val}` : `#/items`;
        });

    } catch (err) {
        app.innerHTML = renderError(err.message);
    }
}