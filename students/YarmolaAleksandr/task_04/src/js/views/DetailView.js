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
                    <nav class="btn-group" style="margin-bottom: 2rem;" aria-label="Навигация и действия" role="navigation">
                        <button class="btn btn-secondary" id="backBtn" aria-label="Вернуться к списку инструментов">← Назад</button>
                        <div style="flex: 1;"></div>
                        ${this.auth && this.auth.isAuthenticated() ? `
                            <a href="#/items/${this.tool.id}/edit" class="btn btn-primary" aria-label="Редактировать ${this.tool.name}">✏️ Редактировать</a>
                            <button class="btn btn-danger" id="deleteBtn" aria-label="Удалить ${this.tool.name}">🗑️ Удалить</button>
                        ` : `
                            <span style="color: var(--text-muted);" role="status" aria-live="polite">🔒 Войдите для редактирования</span>
                        `}
                    </nav>

                    <article class="detail-card" role="article" aria-label="Информация об инструменте ${this.tool.name}">
                        <header class="detail-header">
                            <div class="detail-icon" aria-hidden="true">${this.tool.icon}</div>
                            <div class="detail-info">
                                <h1>${this.tool.name}</h1>
                                <div class="detail-tags" role="group" aria-label="Метаданные">
                                    <span class="tag" aria-label="Категория: ${this.tool.category}">${this.tool.category}</span>
                                    <span class="tag" aria-label="Лицензия: ${this.tool.license}">${this.tool.license}</span>
                                </div>
                            </div>
                        </header>

                        <section class="detail-section" aria-labelledby="description-heading">
                            <h2 id="description-heading">Описание</h2>
                            <p>${this.tool.description}</p>
                        </section>

                        <div class="detail-grid" role="group" aria-label="Рейтинг и дата добавления">
                            <div class="detail-item">
                                <div class="detail-item-label">Рейтинг</div>
                                <div class="detail-item-value" aria-label="Рейтинг ${this.tool.rating} из 5 звезд">${stars}${emptyStars}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-item-label">Дата добавления</div>
                                <div class="detail-item-value" aria-label="Добавлено ${date}">${date}</div>
                            </div>
                        </div>

                        <section class="detail-section" aria-labelledby="platforms-heading">
                            <h2 id="platforms-heading">Платформы</h2>
                            <div class="detail-tags" role="list" aria-label="Поддерживаемые платформы">
                                ${this.tool.platforms.map(platform => 
                                    `<span class="tag" role="listitem" aria-label="Платформа: ${platform}">${platform}</span>`
                                ).join('')}
                            </div>
                        </section>

                        <section class="detail-section" aria-labelledby="website-heading">
                            <h2 id="website-heading">Веб-сайт</h2>
                            <a href="${this.tool.website}" target="_blank" rel="noopener" 
                               style="color: var(--primary); text-decoration: underline;"
                               aria-label="Открыть официальный веб-сайт ${this.tool.name} в новой вкладке">
                                ${this.tool.website}
                            </a>
                        </section>
                    </article>
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
