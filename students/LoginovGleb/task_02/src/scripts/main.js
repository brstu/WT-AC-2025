/**
 * Главная точка входа JavaScript
 * Инициализирует все компоненты после готовности DOM
 */

import { initAccordion } from './accordion.js';
import { initModal } from './modal.js';
import { initForm } from './form.js';
import { initPosts } from './posts.js';
import { initTheme, watchSystemTheme } from './theme.js';

/**
 * Инициализация всех компонентов
 */
function init() {
    console.log('🚀 StarBand Fan Club - Initializing...');
    
    // Инициализировать тему в первую очередь для лучшего UX
    initTheme();
    watchSystemTheme();
    
    // Инициализация компонентов
    initAccordion();
    initModal();
    initForm();
    initPosts();
    
    console.log('✅ All components initialized successfully');
}

// Ожидать готовности DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM уже готов
    init();
}
