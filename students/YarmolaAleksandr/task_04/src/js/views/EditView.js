import { Loading } from '../components/Loading.js';
import { ErrorComponent } from '../components/Error.js';
import { Toast } from '../components/Toast.js';
import { ToolForm } from '../components/ToolForm.js';

/**
 * View для редактирования инструмента
 */
export class EditView {
    constructor(api, router) {
        this.api = api;
        this.router = router;
        this.tool = null;
        this.categories = [];
    }

    /**
     * Рендер страницы редактирования
     * @param {Object} params - Параметры маршрута (id)
     */
    async render(params) {
        const app = document.getElementById('app');
        app.innerHTML = Loading.render('Загрузка...');

        try {
            this.tool = await this.api.getById(params.id);
            this.categories = await this.api.getCategories();
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
        return `
            <div class="main-content">
                <div class="container form">
                    <div class="page-header">
                        <h1 class="page-title">✏️ Редактировать инструмент</h1>
                        <p class="page-subtitle">${this.tool.name}</p>
                    </div>

                    <div class="form-card">
                        <form id="editForm" aria-label="Форма редактирования инструмента">
                            ${ToolForm.renderFields(this.tool, this.categories)}

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary" id="submitBtn" aria-label="Сохранить изменения">
                                    Сохранить
                                </button>
                                <button type="button" class="btn btn-secondary" id="cancelBtn" aria-label="Отменить и вернуться к деталям">
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Привязка обработчиков событий
     */
    attachEventListeners() {
        const form = document.getElementById('editForm');

        // Привязка обработчиков формы (рейтинг, категория)
        ToolForm.attachHandlers();

        // Отправка формы
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(new FormData(form));
        });

        // Отмена
        document.getElementById('cancelBtn')?.addEventListener('click', () => {
            this.router.navigate(`/items/${this.tool.id}`);
        });
    }

    /**
     * Обработка отправки формы
     */
    async handleSubmit(formData) {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Сохранение...';

        try {
            // Сбор данных
            const data = ToolForm.collectData(formData);

            // Валидация
            const errors = ToolForm.validate(data);
            if (Object.keys(errors).length > 0) {
                ToolForm.showErrors(errors);
                throw new Error('Форма содержит ошибки');
            }

            // Обновление
            await this.api.update(this.tool.id, data);
            Toast.success(`"${data.name}" успешно обновлен`);
            this.router.navigate(`/items/${this.tool.id}`);

        } catch (error) {
            console.error('Ошибка при обновлении:', error);
            if (error.message !== 'Форма содержит ошибки') {
                Toast.error('Не удалось обновить инструмент');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Сохранить';
        }
    }
}
