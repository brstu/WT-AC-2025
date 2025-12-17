/**
 * Переиспользуемый компонент формы для создания/редактирования инструментов
 * Устраняет дублирование кода между CreateView и EditView
 */
export class ToolForm {
    /**
     * Генерация HTML полей формы
     * @param {Object} data - Данные инструмента (для редактирования)
     * @param {Array} categories - Список категорий
     * @returns {string} HTML полей формы
     */
    static renderFields(data = {}, categories = []) {
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
                    aria-required="true"
                    aria-describedby="nameError"
                    aria-label="Название инструмента"
                >
                <div class="form-error" id="nameError" role="alert" aria-live="polite"></div>
            </div>

            <div class="form-group">
                <label class="form-label required" for="category">Категория</label>
                <select 
                    id="category" 
                    name="category" 
                    class="form-select" 
                    required
                    aria-required="true"
                    aria-describedby="categoryError"
                    aria-label="Категория инструмента"
                >
                    <option value="">Выберите категорию...</option>
                    ${categories.map(cat => `
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
                    aria-label="Название новой категории"
                >
                <div class="form-error" id="categoryError" role="alert" aria-live="polite"></div>
            </div>

            <div class="form-group">
                <label class="form-label required" for="description">Описание</label>
                <textarea 
                    id="description" 
                    name="description" 
                    class="form-textarea"
                    required
                    aria-required="true"
                    aria-describedby="descriptionError descriptionHint"
                    aria-label="Описание инструмента"
                >${data.description || ''}</textarea>
                <div class="form-hint" id="descriptionHint">Краткое описание инструмента (мин. 20 символов)</div>
                <div class="form-error" id="descriptionError" role="alert" aria-live="polite"></div>
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
                    aria-required="true"
                    aria-describedby="websiteError"
                    aria-label="Официальный веб-сайт инструмента"
                >
                <div class="form-error" id="websiteError" role="alert" aria-live="polite"></div>
            </div>

            <div class="form-group">
                <label class="form-label required" for="license">Лицензия</label>
                <select 
                    id="license" 
                    name="license" 
                    class="form-select" 
                    required
                    aria-required="true"
                    aria-describedby="licenseError"
                    aria-label="Тип лицензии инструмента"
                >
                    <option value="">Выберите лицензию...</option>
                    <option value="MIT" ${data.license === 'MIT' ? 'selected' : ''}>MIT</option>
                    <option value="Apache 2.0" ${data.license === 'Apache 2.0' ? 'selected' : ''}>Apache 2.0</option>
                    <option value="GPL-2.0" ${data.license === 'GPL-2.0' ? 'selected' : ''}>GPL-2.0</option>
                    <option value="GPL-3.0" ${data.license === 'GPL-3.0' ? 'selected' : ''}>GPL-3.0</option>
                    <option value="BSD" ${data.license === 'BSD' ? 'selected' : ''}>BSD</option>
                    <option value="Proprietary" ${data.license === 'Proprietary' ? 'selected' : ''}>Proprietary</option>
                </select>
                <div class="form-error" id="licenseError" role="alert" aria-live="polite"></div>
            </div>

            <div class="form-group">
                <label class="form-label required">Платформы</label>
                <fieldset aria-describedby="platformsError" role="group" aria-label="Поддерживаемые платформы">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                        ${['Windows', 'macOS', 'Linux', 'Web', 'iOS', 'Android'].map(platform => `
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input 
                                    type="checkbox" 
                                    name="platforms" 
                                    value="${platform}"
                                    ${(data.platforms || []).includes(platform) ? 'checked' : ''}
                                    aria-label="${platform}"
                                >
                                ${platform}
                            </label>
                        `).join('')}
                    </div>
                </fieldset>
                <div class="form-error" id="platformsError" role="alert" aria-live="polite"></div>
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
                    aria-required="true"
                    aria-describedby="iconError iconHint"
                    aria-label="Иконка инструмента"
                >
                <div class="form-hint" id="iconHint">Один эмодзи символ</div>
                <div class="form-error" id="iconError" role="alert" aria-live="polite"></div>
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
                    aria-required="true"
                    aria-label="Рейтинг инструмента"
                    aria-valuemin="1"
                    aria-valuemax="5"
                    aria-valuenow="${data.rating || 3}"
                    aria-valuetext="${data.rating || 3} звезд из 5"
                >
                <div style="text-align: center; margin-top: 0.5rem; font-size: 1.5rem;" id="ratingDisplay" aria-live="polite">
                    ${'⭐'.repeat(data.rating || 3)}
                </div>
            </div>
        `;
    }

    /**
     * Валидация данных формы
     * @param {Object} data - Данные для валидации
     * @returns {Object} Объект с ошибками (пустой если ошибок нет)
     */
    static validate(data) {
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
     * Отображение ошибок валидации
     * @param {Object} errors - Объект с ошибками
     */
    static showErrors(errors) {
        // Очистка предыдущих ошибок
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
            el.style.borderColor = '';
            el.setAttribute('aria-invalid', 'false');
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
                inputEl.setAttribute('aria-invalid', 'true');
                inputEl.focus(); // Фокус на первое поле с ошибкой
            }
        });
    }

    /**
     * Привязка обработчиков событий для формы
     */
    static attachHandlers() {
        const categorySelect = document.getElementById('category');
        const newCategoryInput = document.getElementById('newCategory');
        const ratingInput = document.getElementById('rating');
        const ratingDisplay = document.getElementById('ratingDisplay');

        // Отображение рейтинга
        ratingInput?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            ratingDisplay.textContent = '⭐'.repeat(value);
            e.target.setAttribute('aria-valuenow', value);
            e.target.setAttribute('aria-valuetext', `${value} звезд из 5`);
        });

        // Выбор категории
        categorySelect?.addEventListener('change', (e) => {
            if (e.target.value === '__new__') {
                newCategoryInput.style.display = 'block';
                newCategoryInput.required = true;
                newCategoryInput.focus();
            } else {
                newCategoryInput.style.display = 'none';
                newCategoryInput.required = false;
            }
        });
    }

    /**
     * Сбор данных из формы
     * @param {FormData} formData - FormData объект
     * @returns {Object} Объект с данными формы
     */
    static collectData(formData) {
        const categorySelect = document.getElementById('category');
        const newCategoryInput = document.getElementById('newCategory');
        
        return {
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
    }
}
