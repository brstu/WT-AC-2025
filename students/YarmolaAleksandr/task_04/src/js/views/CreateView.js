import { Toast } from '../components/Toast.js';
import { ToolForm } from '../components/ToolForm.js';

/**
 * View для создания нового инструмента
 */
export class CreateView {
    constructor(api, router) {
        this.api = api;
        this.router = router;
        this.categories = [];
    }

    /**
     * Рендер страницы создания
     */
    async render() {
        const app = document.getElementById('app');
        
        try {
            this.categories = await this.api.getCategories();
            app.innerHTML = this.getHTML();
            this.attachEventListeners();
        } catch (error) {
            console.error('Ошибка:', error);
            Toast.error('Не удалось загрузить форму');
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
                        <h1 class="page-title">➕ Добавить новый инструмент</h1>
                    </div>

                    <div class="form-card">
                        <form id="createForm" aria-label="Форма создания нового инструмента">
                            ${ToolForm.renderFields({}, this.categories)}

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary" id="submitBtn" aria-label="Создать инструмент">
                                    Создать
                                </button>
                                <button type="button" class="btn btn-secondary" id="cancelBtn" aria-label="Отменить и вернуться к списку">
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
        const form = document.getElementById('createForm');

        // Привязка обработчиков формы (рейтинг, категория)
        ToolForm.attachHandlers();

        // Отправка формы
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(new FormData(form));
        });

        // Отмена
        document.getElementById('cancelBtn')?.addEventListener('click', () => {
            this.router.navigate('/');
        });
    }

    /**
     * Обработка отправки формы
     */
    async handleSubmit(formData) {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Создание...';

        try {
            // Сбор данных
            const data = ToolForm.collectData(formData);

            // Валидация
            const errors = ToolForm.validate(data);
            if (Object.keys(errors).length > 0) {
                ToolForm.showErrors(errors);
                throw new Error('Форма содержит ошибки');
            }

            // Создание
            await this.api.create(data);
            Toast.success(`"${data.name}" успешно добавлен`);
            this.router.navigate('/');

        } catch (error) {
            console.error('Ошибка при создании:', error);
            if (error.message !== 'Форма содержит ошибки') {
                Toast.error('Не удалось создать инструмент');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Создать';
        }
    }
}
