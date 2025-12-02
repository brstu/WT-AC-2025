/**
 * Form View - Create and Edit event forms
 */

import { getEvent, createEvent, updateEvent, getCategories } from '../api.js';
import { navigate } from '../router.js';
import {
    render,
    showLoading,
    showError,
    showNotification,
    escapeHtml,
    validateForm,
    showFormErrors,
    clearFormErrors,
    getFormData,
    setFormData,
    formatDateForInput
} from './utils.js';

// Validation rules for event form
const validationRules = {
    title: {
        required: true,
        requiredMessage: 'Название события обязательно',
        minLength: 3,
        minLengthMessage: 'Название должно содержать минимум 3 символа',
        maxLength: 200,
        maxLengthMessage: 'Название не должно превышать 200 символов'
    },
    description: {
        required: true,
        requiredMessage: 'Описание события обязательно',
        minLength: 10,
        minLengthMessage: 'Описание должно содержать минимум 10 символов',
        maxLength: 2000,
        maxLengthMessage: 'Описание не должно превышать 2000 символов'
    },
    date: {
        required: true,
        requiredMessage: 'Дата события обязательна',
        custom: (value) => {
            if (!value) return null;
            const selectedDate = new Date(value);
            if (isNaN(selectedDate.getTime())) {
                return 'Введите корректную дату';
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                return 'Дата события не может быть в прошлом';
            }
            return null;
        }
    },
    time: {
        required: true,
        requiredMessage: 'Время начала обязательно'
    },
    location: {
        required: true,
        requiredMessage: 'Место проведения обязательно',
        minLength: 5,
        minLengthMessage: 'Укажите более подробный адрес (минимум 5 символов)'
    },
    category: {
        required: true,
        requiredMessage: 'Выберите категорию события'
    },
    organizer: {
        maxLength: 100,
        maxLengthMessage: 'Имя организатора не должно превышать 100 символов'
    },
    maxParticipants: {
        min: 1,
        minMessage: 'Минимальное количество участников: 1',
        max: 10000,
        maxMessage: 'Максимальное количество участников: 10000'
    },
    image: {
        pattern: /^(https?:\/\/|data:image\/|$)/,
        patternMessage: 'Введите корректный URL изображения (http:// или https://)'
    }
};

/**
 * Render the create form view
 */
export async function renderCreateView() {
    renderFormContent(null);
}

/**
 * Render the edit form view
 * @param {Object} params - Route params with id
 */
export async function renderEditView(params) {
    const { id } = params;
    showLoading('Загрузка события...');
    
    try {
        const event = await getEvent(id);
        renderFormContent(event);
    } catch (error) {
        showError(error.message, () => renderEditView(params));
    }
}

/**
 * Render form content
 * @param {Object|null} event - Event data for editing or null for creating
 */
function renderFormContent(event) {
    const isEdit = event !== null;
    const categories = getCategories();
    
    const html = `
        <div class="form-container">
            <a href="${isEdit ? `#/items/${event.id}` : '#/items'}" class="back-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                ${isEdit ? 'Назад к событию' : 'Назад к списку'}
            </a>
            
            <div class="page-header">
                <h1 class="page-title">${isEdit ? 'Редактирование события' : 'Новое событие'}</h1>
                <p class="page-subtitle">${isEdit ? 'Измените информацию о событии' : 'Заполните информацию о новом событии'}</p>
            </div>
            
            <form id="event-form" class="form" novalidate>
                <div class="form-group">
                    <label for="title" class="form-label form-label--required">Название события</label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        class="form-input"
                        placeholder="Введите название события"
                        maxlength="200"
                        required
                        aria-required="true"
                        aria-describedby="title-hint"
                    >
                    <span id="title-hint" class="form-hint">Краткое, но информативное название (до 200 символов)</span>
                </div>
                
                <div class="form-group">
                    <label for="description" class="form-label form-label--required">Описание</label>
                    <textarea 
                        id="description" 
                        name="description" 
                        class="form-textarea"
                        placeholder="Подробное описание события..."
                        maxlength="2000"
                        required
                        aria-required="true"
                        aria-describedby="description-hint"
                    ></textarea>
                    <span id="description-hint" class="form-hint">Расскажите подробнее о событии (до 2000 символов)</span>
                </div>
                
                <div class="form-group">
                    <label for="category" class="form-label form-label--required">Категория</label>
                    <select 
                        id="category" 
                        name="category" 
                        class="form-select"
                        required
                        aria-required="true"
                    >
                        <option value="">Выберите категорию</option>
                        ${categories.map(cat => `
                            <option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="date" class="form-label form-label--required">Дата</label>
                        <input 
                            type="date" 
                            id="date" 
                            name="date" 
                            class="form-input"
                            required
                            aria-required="true"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="time" class="form-label form-label--required">Время начала</label>
                        <input 
                            type="time" 
                            id="time" 
                            name="time" 
                            class="form-input"
                            required
                            aria-required="true"
                        >
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="location" class="form-label form-label--required">Место проведения</label>
                    <input 
                        type="text" 
                        id="location" 
                        name="location" 
                        class="form-input"
                        placeholder="Город, улица, здание, номер зала..."
                        required
                        aria-required="true"
                        aria-describedby="location-hint"
                    >
                    <span id="location-hint" class="form-hint">Укажите полный адрес или «Онлайн» для вебинаров</span>
                </div>
                
                <div class="form-group">
                    <label for="organizer" class="form-label">Организатор</label>
                    <input 
                        type="text" 
                        id="organizer" 
                        name="organizer" 
                        class="form-input"
                        placeholder="Имя организатора или организации"
                        maxlength="100"
                    >
                </div>
                
                <div class="form-group">
                    <label for="maxParticipants" class="form-label">Максимальное число участников</label>
                    <input 
                        type="number" 
                        id="maxParticipants" 
                        name="maxParticipants" 
                        class="form-input"
                        placeholder="Оставьте пустым, если без ограничений"
                        min="1"
                        max="10000"
                    >
                </div>
                
                <div class="form-group">
                    <label for="image" class="form-label">Изображение (URL)</label>
                    <input 
                        type="url" 
                        id="image" 
                        name="image" 
                        class="form-input"
                        placeholder="https://example.com/image.jpg"
                        aria-describedby="image-hint"
                    >
                    <span id="image-hint" class="form-hint">Ссылка на изображение для обложки события</span>
                </div>
                
                <div id="image-preview" class="mt-md" style="display: none;">
                    <img id="preview-img" src="" alt="Предпросмотр изображения" style="max-width: 100%; max-height: 200px; border-radius: var(--border-radius-md);">
                </div>
                
                <div class="form-actions">
                    <button type="submit" id="submit-btn" class="btn btn--primary btn--lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        ${isEdit ? 'Сохранить изменения' : 'Создать событие'}
                    </button>
                    <a href="${isEdit ? `#/items/${event.id}` : '#/items'}" class="btn btn--secondary btn--lg">
                        Отмена
                    </a>
                </div>
            </form>
        </div>
    `;
    
    render(html);
    
    // Fill form with existing data if editing
    const form = document.getElementById('event-form');
    if (isEdit && form) {
        setFormData(form, {
            ...event,
            date: formatDateForInput(event.date)
        });
    }
    
    attachFormEventHandlers(isEdit ? event.id : null);
}

/**
 * Attach event handlers for form
 * @param {number|null} eventId - Event ID if editing
 */
function attachFormEventHandlers(eventId) {
    const form = document.getElementById('event-form');
    const submitBtn = document.getElementById('submit-btn');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    
    if (!form) return;
    
    // Image preview
    if (imageInput) {
        imageInput.addEventListener('input', () => {
            const url = imageInput.value.trim();
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                previewImg.src = url;
                previewImg.onload = () => {
                    imagePreview.style.display = 'block';
                };
                previewImg.onerror = () => {
                    imagePreview.style.display = 'none';
                };
            } else {
                imagePreview.style.display = 'none';
            }
        });
        
        // Trigger initial preview if editing with existing image
        if (imageInput.value) {
            imageInput.dispatchEvent(new Event('input'));
        }
    }
    
    // Real-time validation on blur
    form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('blur', () => {
            const data = getFormData(form);
            const fieldName = field.name;
            
            if (validationRules[fieldName]) {
                const { errors } = validateForm(
                    { [fieldName]: data[fieldName] },
                    { [fieldName]: validationRules[fieldName] }
                );
                
                // Clear previous error for this field
                const existingError = field.parentNode.querySelector('.form-error');
                if (existingError) existingError.remove();
                field.classList.remove('error');
                
                // Show new error if any
                if (errors[fieldName]) {
                    field.classList.add('error');
                    const errorEl = document.createElement('span');
                    errorEl.className = 'form-error';
                    errorEl.textContent = errors[fieldName];
                    field.parentNode.appendChild(errorEl);
                }
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = getFormData(form);
        
        // Validate all fields
        const { isValid, errors } = validateForm(data, validationRules);
        
        if (!isValid) {
            showFormErrors(form, errors);
            // Focus first error field
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.focus();
            }
            return;
        }
        
        clearFormErrors(form);
        
        // Disable submit button
        submitBtn.disabled = true;
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
            ${eventId ? 'Сохранение...' : 'Создание...'}
        `;
        
        try {
            // Prepare data
            const eventData = {
                title: data.title.trim(),
                description: data.description.trim(),
                category: data.category,
                date: data.date,
                time: data.time,
                location: data.location.trim(),
                organizer: data.organizer?.trim() || '',
                maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
                image: data.image?.trim() || ''
            };
            
            if (eventId) {
                // Update existing event
                await updateEvent(eventId, eventData);
                showNotification('Успешно', 'Событие обновлено', 'success');
                navigate(`/items/${eventId}`);
            } else {
                // Create new event
                const newEvent = await createEvent(eventData);
                showNotification('Успешно', 'Событие создано', 'success');
                navigate(`/items/${newEvent.id}`);
            }
        } catch (error) {
            showNotification('Ошибка', error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    });
}
