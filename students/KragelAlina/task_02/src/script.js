import { getValidationMessage } from './validation.js';

const FAVORITES_KEY = 'city-favorites';
const favListContainer = document.getElementById('favorites-list');
const favCounter = document.getElementById('fav-counter');

const renderFavoritesList = (favs) => {
    if (!favListContainer) return;

    if (favs.length === 0) {
        favListContainer.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--text-color);">Здесь пока пусто. Добавьте свои любимые места!</p>';
        return;
    }

    const html = favs.map(item => `
        <div class="card" data-name="${item.name}">
            <h3>${item.name}</h3>
            <p class="card__district">${item.district}</p>
            <button class="btn-remove" data-name="${item.name}" aria-label="Удалить ${item.name} из избранного">Удалить</button>
        </div>
    `).join('');
    favListContainer.innerHTML = html;
};

const updateFavorites = () => {
    const favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    
    if (favCounter) {
        favCounter.textContent = favs.length;
        favCounter.style.display = favs.length > 0 ? 'flex' : 'none';
    }

    renderFavoritesList(favs);
    
    document.querySelectorAll('.btn-favorite').forEach(btn => {
        const name = btn.dataset.name;
        const isFav = favs.some(item => item.name === name);
        btn.setAttribute('aria-pressed', isFav);
        btn.textContent = isFav ? 'В избранном' : 'В избранное';
    });
};

const toggleFavorite = (btn) => {
    const name = btn.dataset.name;
    const district = btn.dataset.district;
    let favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    
    const index = favs.findIndex(item => item.name === name);
    
    if (index === -1) {
        favs.push({ name, district });
    } else {
        favs.splice(index, 1);
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    updateFavorites();
};

const showError = (input, msg) => {
    const err = input.parentElement.querySelector('.error');
    if (err) {
        err.textContent = msg;
    }
    input.setAttribute('aria-invalid', 'true');
};

const clearError = (input) => {
    const err = input.parentElement.querySelector('.error');
    if (err) {
        err.textContent = '';
    }
    input.removeAttribute('aria-invalid');
};

const validateForm = (form) => {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
        clearError(field);
        
        const errorMessage = getValidationMessage(field); 

        if (errorMessage) {
            showError(field, errorMessage);
            valid = false;
        }
    });
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = !valid;
    }
    return valid;
};

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const burgerBtn = document.getElementById('burger');
    const navMenu = document.querySelector('.nav');
    const tabs = document.querySelectorAll('.tabs button[role="tab"]');
    const form = document.querySelector('.feedback-form');
    const success = document.querySelector('.form-success');
    const modals = document.querySelectorAll('.modal');
    
    updateFavorites();

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        themeToggle.innerHTML = theme === 'dark' ? 'Светлая тема' : 'Темная тема'; 
        localStorage.setItem('theme', theme);
    };
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));

    themeToggle.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', () => {
            const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
            
            burgerBtn.setAttribute('aria-expanded', !isExpanded);
            
            navMenu.classList.toggle('nav-open'); // <-- ИСПРАВЛЕНО
            
            navMenu.setAttribute('aria-hidden', isExpanded); 
        });
    }

    const switchTab = (tabId) => {
        tabs.forEach(tab => {
            tab.setAttribute('aria-selected', 'false');
            document.getElementById(tab.getAttribute('aria-controls'))?.setAttribute('hidden', '');
        });

        const activeTab = document.getElementById(tabId);
        const activeSectionId = activeTab?.getAttribute('aria-controls');
        const activeSection = document.getElementById(activeSectionId);
        
        activeTab?.setAttribute('aria-selected', 'true');
        activeSection?.removeAttribute('hidden');
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.id));
    });

    document.querySelectorAll('.place-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const contentId = button.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            document.querySelectorAll('.place-trigger[aria-expanded="true"]').forEach(openBtn => {
                 if (openBtn !== button) {
                    openBtn.setAttribute('aria-expanded', 'false');
                    document.getElementById(openBtn.getAttribute('aria-controls'))?.setAttribute('aria-hidden', 'true');
                }
            });

            button.setAttribute('aria-expanded', !isExpanded);
            content?.setAttribute('aria-hidden', isExpanded);
        });
    });

    let focusedElementBeforeModal;

    const openModal = (modalId, triggerElement) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            focusedElementBeforeModal = triggerElement || document.activeElement;
            modal.removeAttribute('aria-hidden');
            modal.classList.add('modal-visible'); // <-- ИСПРАВЛЕНО
            modal.querySelector('.modal-content')?.focus();
        }
    };
    const closeModal = (modal) => {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('modal-visible'); // <-- ИСПРАВЛЕНО
        focusedElementBeforeModal?.focus(); 
    };

    document.addEventListener('click', (e) => {
        if (e.target.dataset.modal) {
            openModal(e.target.dataset.modal, e.target);
        }
        
        if (e.target.classList.contains('modal-close')) {
            closeModal(e.target.closest('.modal'));
        }
        
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target.closest('.modal'));
        }
        
        if (e.target.classList.contains('btn-favorite')) {
            toggleFavorite(e.target);
        }
        if (e.target.classList.contains('btn-remove')) {
            const name = e.target.dataset.name;
            const tempBtn = document.querySelector(`.btn-favorite[data-name="${name}"]`);
            if (tempBtn) {
                 toggleFavorite(tempBtn);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('modal-visible')) {
                    closeModal(modal);
                }
            });
        }
    });
    
    if (form) {
        form.addEventListener('input', () => validateForm(form));
        form.addEventListener('blur', e => { 
            if (e.target.hasAttribute('required')) validateForm(form); 
        }, true);

        form.addEventListener('submit', e => {
            e.preventDefault();
            if (validateForm(form)) {
                success.hidden = false;
                form.reset();
                validateForm(form); 
                
                setTimeout(() => {
                    success.hidden = true;
                }, 5000);
            }
        });
    }

});