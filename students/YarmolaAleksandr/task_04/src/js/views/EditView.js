import { Loading } from '../components/Loading.js';
import { ErrorComponent } from '../components/Error.js';
import { Toast } from '../components/Toast.js';

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
                        <form id="editForm">
                            ${this.getFormFields()}

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary" id="submitBtn">
                                    Сохранить
                                </button>
                                <button type="button" class="btn btn-secondary" id="cancelBtn">
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
     * Поля формы (переиспользуем логику из CreateView)
     */
    getFormFields() {
        const data = this.tool;
        return `
            <div class="form-group">
                <label class="form-label required" for="name">Название</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    class="form-input" 
                    value="${data.name || ''}"
                    required
                >
                <div class="form-error" id="nameError"></div>
            </div>

            <div class="form-group">
                <label class="form-label required" for="category">Категория</label>
                <select id="category" name="category" class="form-select" required>
                    <option value="">Выберите категорию...</option>
                    ${this.categories.map(cat => `
                        <option value="${cat}" ${data.category === cat ? 'selected' : ''}>
                            ${cat}
                        </option>
                    `).join('')}
                    <option value="__new__">+ Создать новую</option>
                </select>
                <input 
                    type="text" 
                    id="newCategory" 
                    class="form-input" 
                    placeholder="Введите название новой категории"
                    style="display: none; margin-top: 0.5rem;"
                >
                <div class="form-error" id="categoryError"></div>
            </div>

            <div class="form-group">
                <label class="form-label required" for="description">Описание</label>
                <textarea 
                    id="description" 
                    name="description" 
                    class="form-textarea"
                    required
                >${data.description || ''}</textarea>
                <div class="form-hint">Краткое описание инструмента (мин. 20 символов)</div>
                <div class="form-error" id="descriptionError"></div>
            </div>

            <div class="form-group">
                <label class="form-label required" for="website">Веб-сайт</label>
                <input 
                    type="url" 
                    id="website" 
                    name="website" 
                    class="form-input"
                    value="${data.website || ''}"
                    placeholder="https://example.com"
                    required
                >
                <div class="form-error" id="websiteError"></div>
            </div>

            <div class="form-group">
                <label class="form-label required" for="license">Лицензия</label>
                <select id="license" name="license" class="form-select" required>
                    <option value="">Выберите лицензию...</option>
                    <option value="MIT" ${data.license === 'MIT' ? 'selected' : ''}>MIT</option>
                    <option value="Apache 2.0" ${data.license === 'Apache 2.0' ? 'selected' : ''}>Apache 2.0</option>
                    <option value="GPL-2.0" ${data.license === 'GPL-2.0' ? 'selected' : ''}>GPL-2.0</option>
                    <option value="GPL-3.0" ${data.license === 'GPL-3.0' ? 'selected' : ''}>GPL-3.0</option>
                    <option value="BSD" ${data.license === 'BSD' ? 'selected' : ''}>BSD</option>
                    <option value="Proprietary" ${data.license === 'Proprietary' ? 'selected' : ''}>Proprietary</option>
                </select>
                <div class="form-error" id="licenseError"></div>
            </div>

            <div class="form-group">
                <label class="form-label required">Платформы</label>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                    ${['Windows', 'macOS', 'Linux', 'Web', 'iOS', 'Android'].map(platform => `
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input 
                                type="checkbox" 
                                name="platforms" 
                                value="${platform}"
                                ${(data.platforms || []).includes(platform) ? 'checked' : ''}
                            >
                            ${platform}
                        </label>
                    `).join('')}
                </div>
                <div class="form-error" id="platformsError"></div>
            </div>

            <div class="form-group">
                <label class="form-label required" for="icon">Иконка (эмодзи)</label>
                <input 
                    type="text" 
                    id="icon" 
                    name="icon" 
                    class="form-input"
                    value="${data.icon || '🛠️'}"
                    maxlength="2"
                    required
                >
                <div class="form-hint">Один эмодзи символ</div>
                <div class="form-error" id="iconError"></div>
            </div>

            <div class="form-group">
                <label class="form-label required" for="rating">Рейтинг</label>
                <input 
                    type="range" 
                    id="rating" 
                    name="rating" 
                    class="form-input"
                    min="1" 
                    max="5" 
                    value="${data.rating || 3}"
                    step="1"
                    required
                >
                <div style="text-align: center; margin-top: 0.5rem; font-size: 1.5rem;" id="ratingDisplay">
                    ${'⭐'.repeat(data.rating || 3)}
                </div>
            </div>
        `;
    }

    /**
     * Привязка обработчиков событий
     */
    attachEventListeners() {
        const form = document.getElementById('editForm');
        const categorySelect = document.getElementById('category');
        const newCategoryInput = document.getElementById('newCategory');
        const ratingInput = document.getElementById('rating');
        const ratingDisplay = document.getElementById('ratingDisplay');

        // Отображение рейтинга
        ratingInput?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            ratingDisplay.textContent = '⭐'.repeat(value);
        });

        // Выбор категории
        categorySelect?.addEventListener('change', (e) => {
            if (e.target.value === '__new__') {
                newCategoryInput.style.display = 'block';
                newCategoryInput.required = true;
            } else {
                newCategoryInput.style.display = 'none';
                newCategoryInput.required = false;
            }
        });

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
     * Валидация данных
     */
    validateData(data) {
        const errors = {};

        if (!data.name || data.name.trim().length < 2) {
            errors.name = 'Название должно содержать минимум 2 символа';
        }

        if (!data.category || data.category === '__new__') {
            errors.category = 'Выберите или создайте категорию';
        }

        if (!data.description || data.description.trim().length < 20) {
            errors.description = 'Описание должно содержать минимум 20 символов';
        }

        if (!data.website || !data.website.startsWith('http')) {
            errors.website = 'Введите корректный URL (начинается с http:// или https://)';
        }

        if (!data.license) {
            errors.license = 'Выберите лицензию';
        }

        if (!data.platforms || data.platforms.length === 0) {
            errors.platforms = 'Выберите хотя бы одну платформу';
        }

        if (!data.icon || data.icon.length > 2) {
            errors.icon = 'Введите один эмодзи символ';
        }

        return errors;
    }

    /**
     * Отображение ошибок
     */
    showErrors(errors) {
        // Очистка предыдущих ошибок
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
            el.style.borderColor = '';
        });

        // Отображение новых ошибок
        Object.keys(errors).forEach(field => {
            const errorEl = document.getElementById(`${field}Error`);
            const inputEl = document.getElementById(field);
            
            if (errorEl) {
                errorEl.textContent = errors[field];
            }
            if (inputEl) {
                inputEl.style.borderColor = 'var(--danger)';
            }
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
            const categorySelect = document.getElementById('category');
            const newCategoryInput = document.getElementById('newCategory');
            
            const data = {
                name: formData.get('name').trim(),
                category: categorySelect.value === '__new__' ? 
                    newCategoryInput.value.trim() : formData.get('category'),
                description: formData.get('description').trim(),
                website: formData.get('website').trim(),
                license: formData.get('license'),
                platforms: formData.getAll('platforms'),
                icon: formData.get('icon').trim(),
                rating: parseInt(formData.get('rating'))
            };

            // Валидация
            const errors = this.validateData(data);
            if (Object.keys(errors).length > 0) {
                this.showErrors(errors);
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
