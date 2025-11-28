// Данные игр для демонстрации
const gamesData = {
    action: [
        {
            id: 1,
            title: "Cyberpunk 2077",
            description: "Приключенческая ролевая игра в открытом мире, действие которой происходит в Найт-Сити.",
            image: "images/cyberpunk-2077.jpg",
            review: {
                title: "Cyberpunk 2077: Футуристический шедевр",
                content: "Cyberpunk 2077 предлагает захватывающий мир будущего с глубоким сюжетом и впечатляющей графикой. Несмотря на некоторые технические проблемы при запуске, игра представляет собой уникальный опыт.",
                rating: 4,
                image: "images/cyberpunk-2077-review.jpg"
            }
        },
        {
            id: 2,
            title: "Doom Eternal",
            description: "Продолжение культового шутера, где вы сражаетесь с демонами из ада.",
            image: "images/doom-eternal.jpg",
            review: {
                title: "Doom Eternal: Адский экшен",
                content: "Doom Eternal - это чистейший экшен, который заставляет кровь бежать быстрее. Игра предлагает улучшенный геймплей, новые враги и оружие, а также потрясающую графику.",
                rating: 5,
                image: "images/doom-eternal-review.jpg"
            }
        }
    ],
    rpg: [
        {
            id: 3,
            title: "The Witcher 3",
            description: "Эпическая ролевая игра по мотивам книг Анджея Сапковского.",
            image: "images/witcher-3.jpg",
            review: {
                title: "The Witcher 3: Шедевр ролевых игр",
                content: "The Witcher 3 устанавливает новые стандарты для ролевых игр. Глубокий сюжет, проработанные персонажи и огромный открытый мир делают эту игру обязательной к прохождению.",
                rating: 5,
                image: "images/witcher-3-review.jpg"
            }
        },
        {
            id: 4,
            title: "Elden Ring",
            description: "Фэнтезийная ролевая игра от создателей Dark Souls.",
            image: "images/elden-ring.jpg",
            review: {
                title: "Elden Ring: Новый стандарт жанра",
                content: "Elden Ring объединяет сложный геймплей Souls-игр с огромным открытым миром. Игра предлагает невероятную свободу исследований и запоминающиеся босс-сражения.",
                rating: 5,
                image: "images/elden-ring-review.jpg"
            }
        }
    ],
    strategy: [
        {
            id: 5,
            title: "Civilization VI",
            description: "Постройте империю, которая выдержит испытание временем.",
            image: "images/civilization-vi.jpg",
            review: {
                title: "Civilization VI: Стратегия на века",
                content: "Civilization VI продолжает наследие серии, предлагая глубокую и увлекательную пошаговую стратегию. Новая система районов добавляет глубины городскому планированию.",
                rating: 4,
                image: "images/civilization-vi-review.jpg"
            }
        },
        {
            id: 6,
            title: "XCOM 2",
            description: "Тактическая стратегия о сопротивлении инопланетному вторжению.",
            image: "images/xcom-2.jpg",
            review: {
                title: "XCOM 2: Тактическое совершенство",
                content: "XCOM 2 предлагает напряженные тактические сражения с высокими ставками. Перманентная смерть солдат создает эмоциональную связь с персонажами и делает каждое решение важным.",
                rating: 4,
                image: "images/xcom-2-review.jpg"
            }
        }
    ]
};

// Функция инициализации табов
function initTabs() {
    const tabTriggers = document.querySelectorAll('.tabs-trigger');
    const tabPanels = document.querySelectorAll('.tabs-panel');
    
    console.log('Найдено триггеров табов:', tabTriggers.length);
    
    tabTriggers.forEach((trigger, index) => {
        console.log(`Инициализация таба ${index + 1}:`, trigger.textContent);
        
        trigger.addEventListener('click', function() {
            console.log('Клик по табу:', this.textContent);
            
            // Сбрасываем все табы
            tabTriggers.forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });
            
            // Скрываем все панели
            tabPanels.forEach(panel => {
                panel.setAttribute('aria-hidden', 'true');
            });
            
            // Активируем текущий таб
            this.setAttribute('aria-selected', 'true');
            this.removeAttribute('tabindex');
            
            // Показываем соответствующую панель
            const panelId = this.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.setAttribute('aria-hidden', 'false');
                console.log('Активирована панель:', panelId);
            }
        });
        
        // Обработка клавиатурных событий для табов
        trigger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                console.log('Активация таба с клавиатуры:', this.textContent);
                this.click();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextTab = this.parentElement.nextElementSibling?.querySelector('.tabs-trigger') || 
                               document.querySelector('.tabs-trigger');
                if (nextTab) {
                    nextTab.focus();
                    console.log('Фокус перемещен на следующий таб');
                }
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevTab = this.parentElement.previousElementSibling?.querySelector('.tabs-trigger') || 
                               document.querySelectorAll('.tabs-trigger')[document.querySelectorAll('.tabs-trigger').length - 1];
                if (prevTab) {
                    prevTab.focus();
                    console.log('Фокус перемещен на предыдущий таб');
                }
            }
        });
    });
}

// Функция создания карточки игры
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-id', game.id);
    
    // Проверяем, есть ли лайк в localStorage
    const isLiked = localStorage.getItem(`game-${game.id}-liked`) === 'true';
    
    card.innerHTML = `
        <img src="${game.image}" alt="${game.title}" onerror="this.src='https://via.placeholder.com/300x180?text=Image+Error'">
        <div class="game-card-content">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <div class="game-card-actions">
                <button class="btn btn-primary" data-action="review" aria-label="Читать обзор ${game.title}">Обзор</button>
                <button class="btn-like ${isLiked ? 'liked' : ''}" data-action="like" aria-label="${isLiked ? 'Убрать лайк' : 'Поставить лайк'} ${game.title}">
                    ♥
                </button>
            </div>
        </div>
    `;
    
    console.log(`Создана карточка игры: ${game.title}`);
    return card;
}

// Функция загрузки игр
function loadGames() {
    console.log('Загрузка игр...');
    
    for (const genre in gamesData) {
        const container = document.getElementById(`${genre}-games`);
        
        if (!container) {
            console.error(`Контейнер не найден: ${genre}-games`);
            continue;
        }
        
        console.log(`Загрузка игр жанра ${genre}:`, gamesData[genre].length);
        
        gamesData[genre].forEach(game => {
            const gameCard = createGameCard(game);
            container.appendChild(gameCard);
        });
    }
    
    console.log('Все игры загружены');
}

// Функция инициализации модального окна
function initModal() {
    const modal = document.getElementById('review-modal');
    const closeBtn = document.getElementById('modal-close');
    
    if (!modal || !closeBtn) {
        console.error('Не найдены элементы модального окна');
        return;
    }
    
    console.log('Модальное окно найдено, инициализируем...');

    // Функция открытия модального окна
    window.openModal = function(game) {
        console.log('Открытие модального окна для игры:', game.title);
        const review = game.review;
        const modalBody = document.getElementById('modal-body');
        
        if (!modalBody) {
            console.error('Не найден modal-body');
            return;
        }

        // Создаем звезды рейтинга
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += i < review.rating ? '★' : '☆';
        }
        
        modalBody.innerHTML = `
            <img src="${review.image}" alt="${review.title}" onerror="this.src='https://via.placeholder.com/600x300?text=Image+Not+Found'">
            <div class="modal-rating">
                <span class="rating-stars">${stars}</span>
                <span>${review.rating}/5</span>
            </div>
            <p>${review.content}</p>
        `;
        
        document.getElementById('modal-title').textContent = review.title;
        modal.setAttribute('aria-hidden', 'false');
        
        // Перемещаем фокус в модальное окно
        closeBtn.focus();
        
        // Блокируем прокрутку основного контента
        document.body.style.overflow = 'hidden';
        
        console.log('Модальное окно открыто');
    };
    
    // Функция закрытия модального окна
    window.closeModal = function() {
        console.log('Закрытие модального окна');
        modal.setAttribute('aria-hidden', 'true');
        
        // Восстанавливаем прокрутку
        document.body.style.overflow = '';
        
        // Возвращаем фокус на кнопку, которая открыла модальное окно
        if (window.lastFocusedElement) {
            window.lastFocusedElement.focus();
            console.log('Фокус возвращен на элемент:', window.lastFocusedElement);
        }
    };
    
    // Обработчики событий для закрытия модального окна
    closeBtn.addEventListener('click', function() {
        console.log('Клик по кнопке закрытия');
        window.closeModal();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            console.log('Клик вне модального окна');
            window.closeModal();
        }
    });
    
    // Обработка клавиатурных событий для модального окна
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            console.log('Закрытие модального окна по Escape');
            window.closeModal();
        }
        
        // Ловушка фокуса внутри модального окна
        if (e.key === 'Tab' && modal.getAttribute('aria-hidden') === 'false') {
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                    console.log('Фокус перемещен на последний элемент');
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                    console.log('Фокус перемещен на первый элемент');
                }
            }
        }
    });
    
    console.log('Модальное окно инициализировано');
}

// Функция инициализации делегирования событий для лайков
function initLikeDelegation() {
    const gamesContainers = document.querySelectorAll('.games-grid');
    
    console.log('Найдено контейнеров игр:', gamesContainers.length);
    
    gamesContainers.forEach((container, index) => {
        console.log(`Инициализация делегирования для контейнера ${index + 1}`);
        
        container.addEventListener('click', function(e) {
            const target = e.target;
            const action = target.getAttribute('data-action');
            
            if (!action) return;
            
            const gameCard = target.closest('.game-card');
            if (!gameCard) return;
            
            const gameId = gameCard.getAttribute('data-id');
            const gameTitle = gameCard.querySelector('h3').textContent;
            
            console.log(`Клик по действию: ${action}, игра: ${gameTitle}`);
            
            if (action === 'like') {
                // Переключаем состояние лайка
                const isLiked = target.classList.contains('liked');
                
                if (isLiked) {
                    target.classList.remove('liked');
                    target.setAttribute('aria-label', `Поставить лайк ${gameTitle}`);
                    localStorage.setItem(`game-${gameId}-liked`, 'false');
                    console.log(`Лайк убран с игры: ${gameTitle}`);
                } else {
                    target.classList.add('liked');
                    target.setAttribute('aria-label', `Убрать лайк ${gameTitle}`);
                    localStorage.setItem(`game-${gameId}-liked`, 'true');
                    console.log(`Лайк поставлен игре: ${gameTitle}`);
                }
            } else if (action === 'review') {
                // Сохраняем элемент, который открыл модальное окно
                window.lastFocusedElement = target;
                console.log('Элемент для возврата фокуса сохранен');
                
                // Находим игру по ID
                let game = null;
                for (const genre in gamesData) {
                    const foundGame = gamesData[genre].find(g => g.id == gameId);
                    if (foundGame) {
                        game = foundGame;
                        break;
                    }
                }
                
                if (game && window.openModal) {
                    window.openModal(game);
                } else {
                    console.error('Игра не найдена или функция openModal не определена');
                }
            }
        });
        
        // Обработка клавиатурных событий для кнопок внутри карточек
        container.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target;
                const action = target.getAttribute('data-action');
                
                if (action === 'like' || action === 'review') {
                    e.preventDefault();
                    console.log(`Активация кнопки ${action} с клавиатуры`);
                    target.click();
                }
            }
        });
    });
    
    console.log('Делегирование событий инициализировано');
}

// Функция инициализации формы
function initForm() {
    const form = document.getElementById('comment-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');
    
    if (!form || !nameInput || !emailInput || !messageInput || !submitBtn) {
        console.error('Не найдены элементы формы');
        return;
    }
    
    console.log('Форма найдена, инициализируем...');

    // Валидация при вводе
    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('input', function() {
            console.log(`Ввод в поле ${this.id}:`, this.value);
            validateField(this);
            updateSubmitButton();
        });
        
        input.addEventListener('blur', function() {
            console.log(`Потеря фокуса поля ${this.id}`);
            validateField(this);
        });
    });
    
    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Попытка отправки формы');
        
        // Проверяем все поля перед отправкой
        const isNameValid = validateField(nameInput);
        const isEmailValid = validateField(emailInput);
        const isMessageValid = validateField(messageInput);
        
        console.log('Результаты валидации:', { isNameValid, isEmailValid, isMessageValid });
        
        if (isNameValid && isEmailValid && isMessageValid) {
            // Форма валидна, добавляем комментарий
            addComment({
                name: nameInput.value,
                email: emailInput.value,
                message: messageInput.value,
                date: new Date().toLocaleDateString('ru-RU')
            });
            
            // Очищаем форму
            form.reset();
            updateSubmitButton();
            
            // Показываем сообщение об успехе
            alert('Комментарий успешно добавлен!');
            console.log('Комментарий добавлен');
        } else {
            console.log('Форма невалидна, отправка отменена');
        }
    });
    
    // Функция валидации поля
    function validateField(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        let isValid = true;
        
        if (field.id === 'name') {
            if (field.value.trim() === '') {
                showError(errorElement, 'Пожалуйста, введите ваше имя');
                isValid = false;
            } else {
                hideError(errorElement);
            }
        } else if (field.id === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                showError(errorElement, 'Пожалуйста, введите корректный email');
                isValid = false;
            } else {
                hideError(errorElement);
            }
        } else if (field.id === 'message') {
            if (field.value.length < 20) {
                showError(errorElement, `Сообщение должно содержать не менее 20 символов (сейчас: ${field.value.length})`);
                isValid = false;
            } else {
                hideError(errorElement);
            }
        }
        
        // Добавляем/убираем класс ошибки
        if (isValid) {
            field.classList.remove('error');
            console.log(`Поле ${field.id} валидно`);
        } else {
            field.classList.add('error');
            console.log(`Поле ${field.id} невалидно`);
        }
        
        return isValid;
    }
    
    // Функция показа ошибки
    function showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        console.log('Показана ошибка:', message);
    }
    
    // Функция скрытия ошибки
    function hideError(errorElement) {
        errorElement.classList.remove('show');
        console.log('Ошибка скрыта');
    }
    
    // Функция обновления состояния кнопки отправки
    function updateSubmitButton() {
        const isNameValid = nameInput.value.trim() !== '';
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        const isMessageValid = messageInput.value.length >= 20;
        
        const formValid = isNameValid && isEmailValid && isMessageValid;
        submitBtn.disabled = !formValid;
        
        console.log('Состояние кнопки отправки:', formValid ? 'активна' : 'неактивна');
    }
    
    // Функция добавления комментария
    function addComment(comment) {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) {
            console.error('Не найден comments-list');
            return;
        }
        
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.name}</span>
                <span class="comment-date">${comment.date}</span>
            </div>
            <p>${comment.message}</p>
        `;
        
        // Добавляем комментарий в начало списка
        commentsList.insertBefore(commentElement, commentsList.firstChild);
        console.log('Комментарий добавлен в список');
    }
    
    console.log('Форма инициализирована');
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем приложение...');
    
    try {
        // Инициализация табов
        initTabs();
        console.log('Табы инициализированы');
        
        // Загрузка игр
        loadGames();
        console.log('Игры загружены');
        
        // Инициализация модального окна
        initModal();
        console.log('Модальное окно инициализировано');
        
        // Инициализация формы
        initForm();
        console.log('Форма инициализирована');
        
        // Инициализация делегирования событий для лайков
        initLikeDelegation();
        console.log('Делегирование событий инициализировано');
        
        console.log('Приложение успешно запущено!');
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
    }
});