// modules/utils.js
export function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, duration);
}

export function formatDate(dateString) {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (typeof content === 'string') {
        element.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        element.appendChild(content);
    } else if (Array.isArray(content)) {
        content.forEach(child => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    }
    
    return element;
}

export function validateForm(formData) {
    const errors = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
        errors.name = 'Имя должно содержать минимум 2 символа';
    }
    
    if (!formData.universe || formData.universe.trim().length < 2) {
        errors.universe = 'Укажите вселенную персонажа';
    }
    
    if (!formData.category || formData.category.trim().length < 2) {
        errors.category = 'Укажите категорию персонажа';
    }
    
    if (!formData.description || formData.description.trim().length < 10) {
        errors.description = 'Описание должно содержать минимум 10 символов';
    }
    
    return errors;
}

// ДОБАВЬТЕ ЭТИ ФУНКЦИИ:
export function showError(message, retryAction = null) {
    const appContent = document.getElementById('app-content');
    let retryButton = '';
    
    if (retryAction) {
        retryButton = `<button onclick="${retryAction}">Повторить попытку</button>`;
    }
    
    appContent.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Произошла ошибка</h2>
            <p>${message}</p>
            ${retryButton}
        </div>
    `;
}

export function showEmptyState(message = 'Данные не найдены') {
    const appContent = document.getElementById('app-content');
    appContent.innerHTML = `
        <div class="empty-container">
            <i class="fas fa-search"></i>
            <h2>${message}</h2>
            <button onclick="window.location.hash='#/new'">Добавить первый элемент</button>
        </div>
    `;
}

export function toggleLoading(show) {
    const appContent = document.getElementById('app-content');
    if (show) {
        appContent.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p>Загрузка...</p>
            </div>
        `;
    }
}