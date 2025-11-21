import { Loading } from '../components/Loading.js';
import { ErrorComponent } from '../components/Error.js';
import { Toast } from '../components/Toast.js';

/**
 * View для отображения детальной информации об инструменте
 */
export class DetailView {
    constructor(api, router) {
        this.api = api;
        this.router = router;
        this.tool = null;
        this.auth = api.auth; // Получаем auth из API
    }

    /**
     * Рендер страницы детальной информации
     * @param {Object} params - Параметры маршрута (id)
     */
    async render(params) {
        const app = document.getElementById('app');
        app.innerHTML = Loading.render('Загрузка информации...');

        try {
            this.tool = await this.api.getById(params.id);
            app.innerHTML = this.getHTML();
            this.attachEventListeners();
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
            app.innerHTML = ErrorComponent.render(error.message, () => this.router.navigate('/'));
        }
    }

    /**
     * Генерация HTML
     */
    getHTML() {
        const stars = '⭐'.repeat(this.tool.rating);
        const emptyStars = '☆'.repeat(5 - this.tool.rating);
        const date = new Date(this.tool.createdAt).toLocaleDateString('ru-RU');

        return `
            <div class="main-content">
                <div class="container detail-container">
                    <div class="btn-group" style="margin-bottom: 2rem;">
                        <button class="btn btn-secondary" id="backBtn">← Назад</button>
                        <div style="flex: 1;"></div>
                        ${this.auth && this.auth.isAuthenticated() ? `
                            <a href="#/items/${this.tool.id}/edit" class="btn btn-primary">✏️ Редактировать</a>
                            <button class="btn btn-danger" id="deleteBtn">🗑️ Удалить</button>
                        ` : `
                            <span style="color: var(--text-muted);">🔒 Войдите для редактирования</span>
                        `}
                    </div>

                    <div class="detail-card">
                        <div class="detail-header">
                            <div class="detail-icon">${this.tool.icon}</div>
                            <div class="detail-info">
                                <h1>${this.tool.name}</h1>
                                <div class="detail-tags">
                                    <span class="tag">${this.tool.category}</span>
                                    <span class="tag">${this.tool.license}</span>
                                </div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h2>Описание</h2>
                            <p>${this.tool.description}</p>
                        </div>

                        <div class="detail-grid">
                            <div class="detail-item">
                                <div class="detail-item-label">Рейтинг</div>
                                <div class="detail-item-value">${stars}${emptyStars}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-item-label">Дата добавления</div>
                                <div class="detail-item-value">${date}</div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h2>Платформы</h2>
                            <div class="detail-tags">
                                ${this.tool.platforms.map(platform => 
                                    `<span class="tag">${platform}</span>`
                                ).join('')}
                            </div>
                        </div>

                        <div class="detail-section">
                            <h2>Веб-сайт</h2>
                            <a href="${this.tool.website}" target="_blank" rel="noopener" 
                               style="color: var(--primary); text-decoration: underline;">
                                ${this.tool.website}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Привязка обработчиков событий
     */
    attachEventListeners() {
        // Кнопка "Назад"
        document.getElementById('backBtn')?.addEventListener('click', () => {
            this.router.navigate('/');
        });

        // Кнопка "Удалить"
        document.getElementById('deleteBtn')?.addEventListener('click', () => {
            this.handleDelete();
        });
    }

    /**
     * Обработка удаления
     */
    async handleDelete() {
        if (!confirm(`Вы уверены, что хотите удалить "${this.tool.name}"?`)) {
            return;
        }

        try {
            await this.api.delete(this.tool.id);
            Toast.success(`"${this.tool.name}" успешно удален`);
            this.router.navigate('/');
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            Toast.error('Не удалось удалить инструмент');
        }
    }
}
