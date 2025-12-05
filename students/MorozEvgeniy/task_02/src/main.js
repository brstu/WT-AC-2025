let tasks = [
    { id: 1, name: 'Изучить DOM', email: 'student@study.com', desc: 'Прочитать про querySelector и события.', status: 'todo' },
    { id: 2, name: 'Сверстать макет', email: 'designer@study.com', desc: 'Подготовить HTML и CSS структуру.', status: 'progress' }
];

let editingId = null; 

const board = document.getElementById('board');
const modal = document.getElementById('modal');
const form = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title'); 
const btnOpenModal = document.getElementById('open-modal-btn');
const btnSubmit = document.getElementById('submit-btn');

function renderTasks() {
    document.querySelectorAll('.column__list').forEach(list => list.innerHTML = '');

    tasks.forEach(task => {
        const column = document.querySelector(`.column__list[data-status="${task.status}"]`);
        if (column) {
            const card = document.createElement('article');
            card.className = 'card';
            card.dataset.id = task.id; 
            card.innerHTML = `
                <div class="card__header">
                    <span>${escapeHtml(task.name)}</span>
                </div>
                <span class="card__email">${escapeHtml(task.email)}</span>
                <p class="card__desc">${escapeHtml(task.desc)}</p>
                <div class="card__actions">
                    ${task.status !== 'done' ? `<button class="btn btn--sm btn--primary" data-action="move">Next</button>` : ''}
                    <button class="btn btn--sm" data-action="edit" style="background: #e5e7eb;">Edit</button>
                    <button class="btn btn--sm btn--danger" data-action="delete">Del</button>
                </div>
            `;
            column.appendChild(card);
        }
    });
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function initTabs() {
    const tabsContainer = document.querySelector('.tabs__controls');
    const tabs = tabsContainer.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('[role="tabpanel"]');

    tabsContainer.addEventListener('click', (e) => {
        const clickedTab = e.target.closest('[role="tab"]');
        if (!clickedTab) return;

        tabs.forEach(t => {
            t.setAttribute('aria-selected', false);
            t.classList.remove('active');
        });
        clickedTab.setAttribute('aria-selected', true);
        clickedTab.classList.add('active');

        const panelId = clickedTab.getAttribute('aria-controls');
        panels.forEach(p => {
            p.hidden = p.id !== panelId;
        });
    });
}

function openModal(isEdit = false) {
    modal.hidden = false;
    
    if (isEdit) {
        modalTitle.textContent = 'Редактировать задачу';
        btnSubmit.textContent = 'Сохранить изменения';
    } else {
        modalTitle.textContent = 'Новая задача';
        btnSubmit.textContent = 'Создать задачу';
        form.reset();
        editingId = null;
    }
    
    modal.querySelector('input').focus();
    resetValidation(); 
    checkFormValidity(); 
}

function closeModal() {
    modal.hidden = true;
    editingId = null; 
    btnOpenModal.focus(); 
}

function initModal() {
    btnOpenModal.addEventListener('click', () => openModal(false));

    modal.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-close')) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !modal.hidden) {
            const focusables = modal.querySelectorAll('button, input, textarea, [href]');
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        }
    });
}

function initBurger() {
    const burger = document.querySelector('.burger');
    const nav = document.getElementById('main-nav');
    burger.addEventListener('click', () => {
        const isExpanded = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', !isExpanded);
        nav.hidden = isExpanded;
        nav.style.display = isExpanded ? '' : 'block';
    });
}

const validators = {
    name: (val) => val.trim().length > 0 ? null : "Введите название задачи",
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : "Введите корректный email",
    message: (val) => val.trim().length >= 20 ? null : `Минимум 20 символов (${val.trim().length})`
};

function validateField(input) {
    const fieldName = input.name;
    const errorSpan = document.getElementById(`error-${fieldName === 'message' ? 'desc' : fieldName}`);
    const errorMessage = validators[fieldName](input.value);
    
    if (errorMessage) {
        input.classList.add('invalid');
        input.classList.remove('valid');
        errorSpan.textContent = errorMessage;
        return false;
    } else {
        input.classList.remove('invalid');
        input.classList.add('valid');
        errorSpan.textContent = '';
        return true;
    }
}

function checkFormValidity() {
    const inputs = Array.from(form.querySelectorAll('input, textarea'));
    const isValid = inputs.every(input => !validators[input.name](input.value));
    btnSubmit.disabled = !isValid;
}

function resetValidation() {
    form.querySelectorAll('.form__input').forEach(el => el.classList.remove('valid', 'invalid'));
    form.querySelectorAll('.form__error').forEach(el => el.textContent = '');
}

function initFormValidation() {
    form.addEventListener('input', (e) => {
        validateField(e.target);
        checkFormValidity();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        if (editingId) {
            const task = tasks.find(t => t.id === editingId);
            if (task) {
                task.name = formData.get('name');
                task.email = formData.get('email');
                task.desc = formData.get('message');
            }
        } else {
            const newTask = {
                id: Date.now(),
                name: formData.get('name'),
                email: formData.get('email'),
                desc: formData.get('message'),
                status: 'todo'
            };
            tasks.push(newTask);
        }

        renderTasks();
        closeModal();
    });
}

function initDelegation() {
    board.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const card = btn.closest('.card');
        const id = Number(card.dataset.id);

        if (btn.dataset.action === 'delete') {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        } 
        else if (btn.dataset.action === 'move') {
            const task = tasks.find(t => t.id === id);
            if (task.status === 'todo') task.status = 'progress';
            else if (task.status === 'progress') task.status = 'done';
            renderTasks();
        }
        else if (btn.dataset.action === 'edit') {
            const task = tasks.find(t => t.id === id);
            if (task) {
                editingId = id; 
                form.elements['name'].value = task.name;
                form.elements['email'].value = task.email;
                form.elements['message'].value = task.desc;
                
                openModal(true); 
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    initTabs();
    initModal();
    initBurger();
    initFormValidation();
    initDelegation();
});