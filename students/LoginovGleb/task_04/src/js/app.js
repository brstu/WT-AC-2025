/**
 * Main Application Module
 * Initializes the SPA and sets up routing
 */

import { initApi, isAuthenticated, toggleAuth } from './api.js';
import { addRoute, setNotFoundHandler, initRouter, navigate } from './router.js';
import { initViews, render, showNotification } from './views/utils.js';
import { renderListView } from './views/listView.js';
import { renderDetailView } from './views/detailView.js';
import { renderCreateView, renderEditView } from './views/formView.js';

/**
 * Initialize the application
 */
async function init() {
    console.log('Initializing Events SPA...');
    
    // Initialize modules
    initViews();
    await initApi();
    
    // Setup routes
    setupRoutes();
    
    // Setup auth toggle
    setupAuth();
    
    // Initialize router (this will trigger initial route handling)
    initRouter();
    
    console.log('Events SPA initialized successfully');
}

/**
 * Setup application routes
 */
function setupRoutes() {
    // List view - shows all events
    addRoute('/items', renderListView);
    
    // Create view - form for new event
    addRoute('/new', renderCreateView);
    
    // Detail view - shows single event
    addRoute('/items/:id', renderDetailView);
    
    // Edit view - form for editing event
    addRoute('/items/:id/edit', renderEditView);
    
    // 404 handler
    setNotFoundHandler(() => {
        render(`
            <div class="error-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <h2>Страница не найдена</h2>
                <p>Запрошенная страница не существует или была удалена</p>
                <a href="#/items" class="btn btn--primary">Вернуться к списку</a>
            </div>
        `);
    });
}

/**
 * Setup authentication toggle
 */
function setupAuth() {
    const authToggle = document.getElementById('auth-toggle');
    const authStatus = document.querySelector('.auth-status');
    const authText = document.querySelector('.auth-text');
    
    if (!authToggle) return;
    
    // Update UI based on current auth state
    function updateAuthUI() {
        const authenticated = isAuthenticated();
        authStatus.classList.toggle('authenticated', authenticated);
        authToggle.setAttribute('aria-pressed', authenticated);
        authText.textContent = authenticated ? 'Выйти' : 'Войти';
    }
    
    // Initial state
    updateAuthUI();
    
    // Toggle handler
    authToggle.addEventListener('click', () => {
        const newState = toggleAuth();
        updateAuthUI();
        
        if (newState) {
            showNotification('Авторизация', 'Вы успешно вошли в систему', 'success');
        } else {
            showNotification('Авторизация', 'Вы вышли из системы', 'info');
        }
    });
}

/**
 * Handle unhandled errors
 * Filters out image loading errors to avoid notification spam
 */
window.addEventListener('error', (event) => {
    // Ignore image loading errors
    if (event.target && event.target.tagName === 'IMG') {
        return;
    }
    console.error('Unhandled error:', event.error);
    showNotification('Ошибка', 'Произошла непредвиденная ошибка', 'error');
}, true);

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('Ошибка', 'Произошла непредвиденная ошибка', 'error');
});

// Start the application
document.addEventListener('DOMContentLoaded', init);
