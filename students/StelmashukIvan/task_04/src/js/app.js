import { initRouter } from './router.js';
import { showNotification } from './views/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        showNotification('Произошла непредвиденная ошибка', 'error');
    });
});

window.showNotification = showNotification;