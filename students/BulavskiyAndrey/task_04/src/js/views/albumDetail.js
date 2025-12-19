import { api } from '../api.js';
import { Router } from '../router.js';

function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
}

export async function renderAlbumDetail({ params }) {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="card loading">Loading.../div>`;

    try {
        const album = await api.getAlbum(params.id);

        app.innerHTML = `
            <div class="card">
                <div class="header-row">
                    <div>
                        <h2 style="margin:0">${escapeHtml(album.title)}</h2>
                        <div class="note">${escapeHtml(album.artist)} • ${album.year || '—'}</div>
                    </div>
                    <div style="display:flex;gap:8px">
                        <a class="btn" href="#/albums/${album.id}/edit">Редактировать</a>
                        <button id="delBtn" class="btn danger">Удалить</button>
                        <a class="btn" href="#/albums">Назад</a>
                    </div>
                </div>
                <div class="card">
                    <p class="note"><strong>Жанр:</strong> ${escapeHtml(album.genre || '—')}</p>
                    <p>${escapeHtml(album.description || '')}</p>
                </div>
            </div>
        `;

        const delBtn = document.getElementById('delBtn');

        delBtn.addEventListener('click', async () => {
            // 1️⃣ Подтверждение
            const confirmDel = confirm('Удалить альбом?');
            if (!confirmDel) return;

            delBtn.disabled = true;
            delBtn.textContent = 'Удаляем...';

            try {
                // 2️⃣ Удаление через API
                await api.deleteAlbum(album.id);

                // 2️⃣ Уведомление
                alert('✅ Альбом удалён успешно!');

                // 3️⃣ Переход на список альбомов
                Router.go('/albums');

            } catch (err) {
                alert('Ошибка при удалении: ' + err.message);
                delBtn.disabled = false;
                delBtn.textContent = 'Удалить';
            }
        });

    } catch (err) {
        if (err.message && err.message.includes('404')) {
            app.innerHTML = `
                <div class="card">
                    <h2>empty</h2>
                    <a class="btn" href="#/albums">Назад</a>
                </div>
            `;
        } else {
            app.innerHTML = `<div class="card error">Ошибка: ${escapeHtml(err.message)}</div>`;
        }
    }
}
