import api from '../api.js';
import { renderLoader, renderError, showNotification } from '../utils.js';

export async function detailPage({ params }) {
    const app = document.getElementById('app');
    app.innerHTML = renderLoader();

    try {
        const gadget = await api.getById(params.id);
        
        app.innerHTML = `
            <div class="card">
                <a href="#/items" class="btn">← Назад</a>
                <h1>${gadget.name}</h1>
                <p><strong>Бренд:</strong> ${gadget.brand}</p>
                <p><strong>Цена:</strong> $${gadget.price}</p>
                <p><strong>Описание:</strong> ${gadget.desc}</p>
                <hr>
                <div style="margin-top: 1rem;">
                    <a href="#/items/${gadget.id}/edit" class="btn btn-primary">Редактировать</a>
                    <button id="btn-delete" class="btn btn-danger">Удалить</button>
                </div>
            </div>
        `;

        document.getElementById('btn-delete').addEventListener('click', async () => {
            if (confirm('Вы уверены, что хотите удалить этот гаджет?')) {
                try {
                    await api.delete(gadget.id);
                    showNotification('Гаджет удален');
                    location.hash = '#/items';
                } catch (e) {
                    showNotification('Ошибка удаления', 'error');
                }
            }
        });

    } catch (err) {
        app.innerHTML = renderError('Гаджет не найден или удален');
    }
}