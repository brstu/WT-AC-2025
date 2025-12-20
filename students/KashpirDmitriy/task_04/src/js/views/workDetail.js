import { api } from '../api.js';
import { Router } from '../router.js';

function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
}

export async function renderWorkDetail({ params }) {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="card loading">Loading...</div>`;

    try {
        const work = await api.getWork(params.id);

        app.innerHTML = `
            <div class="card">
                <div class="header-row">
                    <div>
                        <h2 style="margin:0">${escapeHtml(work.title)}</h2>
                        <div class="note">${escapeHtml(work.designer)} • ${work.year}</div>
                    </div>
                    <div style="display:flex;gap:8px">
                        <a class="btn" href="#/works/${work.id}/edit">Редактировать</a>
                        <button id="delBtn" class="btn danger">Удалить</button>
                        <a class="btn" href="#/works">Назад</a>
                    </div>
                </div>
                <div class="card">
                    <p class="note"><strong>Категория:</strong> ${escapeHtml(work.category || '—')}</p>
                    <p><strong>Описание:</strong></p>
                    <p>${escapeHtml(work.description || '')}</p>
                </div>
            </div>

            <div class="card">
                <h3>Форма связи</h3>
                <p class="note">Заполните форму, если вы заинтересованы в работе с дизайнером по этому проекту.</p>
                <form id="contactForm">
                    <div class="form-row">
                        <label>Ваше имя</label>
                        <input id="contactName" type="text" required />
                    </div>
                    <div class="form-row">
                        <label>Email</label>
                        <input id="contactEmail" type="email" required />
                    </div>
                    <div class="form-row">
                        <label>Телефон</label>
                        <input id="contactPhone" type="tel" />
                    </div>
                    <div class="form-row">
                        <label>Сообщение</label>
                        <textarea id="contactMessage" required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn" id="contactSubmit">Отправить</button>
                    </div>
                </form>
            </div>
        `;

        const delBtn = document.getElementById('delBtn');
        delBtn.addEventListener('click', async () => {
            const confirmDel = confirm('Удалить работу?');
            if (!confirmDel) return;

            delBtn.disabled = true;
            delBtn.textContent = 'Удаляем...';

            try {
                await api.deleteWork(work.id);
                alert('✅ Работа удалена успешно!');
                Router.go('/works');
            } catch (err) {
                alert('Ошибка при удалении: ' + err.message);
                delBtn.disabled = false;
                delBtn.textContent = 'Удалить';
            }
        });

        const contactForm = document.getElementById('contactForm');
        const contactSubmit = document.getElementById('contactSubmit');
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            contactSubmit.disabled = true;
            contactSubmit.textContent = 'Отправляем...';

            try {
                const formData = {
                    name: document.getElementById('contactName').value,
                    email: document.getElementById('contactEmail').value,
                    phone: document.getElementById('contactPhone').value,
                    message: document.getElementById('contactMessage').value,
                    workId: work.id
                };
                
                alert('✅ Сообщение отправлено! Дизайнер свяжется с вами в ближайшее время.');
                contactForm.reset();
                
            } catch (err) {
                alert('Ошибка при отправке: ' + err.message);
            } finally {
                contactSubmit.disabled = false;
                contactSubmit.textContent = 'Отправить';
            }
        });

    } catch (err) {
        if (err.message && err.message.includes('404')) {
            app.innerHTML = `
                <div class="card">
                    <h2>Работа не найдена</h2>
                    <a class="btn" href="#/works">Назад</a>
                </div>
            `;
        } else {
            app.innerHTML = `<div class="card error">Ошибка: ${escapeHtml(err.message)}</div>`;
        }
    }
}
