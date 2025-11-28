// app.js
import { initTabs } from './tabs.js';
import { initPets } from './pets.js';
import { initForm } from './form.js';

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация табов
    initTabs();
    
    // Инициализация карточек питомцев
    initPets();
    
    // Инициализация формы
    initForm();
});