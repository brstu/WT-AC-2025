document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация темы
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Создаем сердечки при смене темы
        createHearts(8);
    });
    
    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        themeIcon.style.transform = theme === 'light' ? 'rotate(0deg)' : 'rotate(180deg)';
        themeIcon.style.transition = 'transform 0.5s ease';
    }
    
    // 2. Бургер-меню
    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.getElementById('nav-list');
    
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navList.hidden = isExpanded;
        navList.classList.toggle('open');
    });
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', (event) => {
        if (!menuToggle.contains(event.target) && !navList.contains(event.target) && navList.classList.contains('open')) {
            menuToggle.click();
        }
    });
    
    // 3. Модальное окно
    const modal = document.getElementById('art-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    let focusedElementBeforeModal = null;
    
    // Данные для модального окна (описания к артам)
    const artDescriptions = {
        'art-1': 'Фрис исследует таинственное Подземелье, полное загадок и неожиданных встреч. Художник передал атмосферу таинственности и надежды.',
        'art-2': 'Братья скелеты Санс и Папайрус в милом чиби-стиле. Санс наблюдает за попытками Папайруса приготовить "особую" пасту.',
        'art-3': 'Андайн и Альфис в научной лаборатории. Драматичный момент их взаимодействия, полный эмоций и научного энтузиазма.',
        'art-4': 'Ториэль в своём уютном доме в Подземелье. Тёплая атмосфера домашнего уюта, контрастирующая с опасностями Подземелья.',
        'art-5': 'Андайн в решающий момент битвы. Художник мастерски передал её решимость и боевой дух.',
        'art-6': 'Меттатон в своём самом зрелищном шоу. Глэм-арт стиль подчёркивает его звёздный статус.'
    };
    
    const openModal = (imgSrc, title, artId, openingElement) => {
        focusedElementBeforeModal = openingElement;
        
        document.getElementById('modal-image').src = imgSrc;
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-description').textContent = artDescriptions[artId] || 'Фанарт по вселенной Undertale.';
        
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = '15px'; // Чтобы не прыгал контент
        modal.hidden = false;
        modalCloseBtn.focus();
        
        document.addEventListener('keydown', handleEscape);
    };
    
    const closeModal = () => {
        modal.hidden = true;
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.removeEventListener('keydown', handleEscape);
        
        if (focusedElementBeforeModal) {
            focusedElementBeforeModal.focus();
        }
    };
    
    modalCloseBtn.addEventListener('click', closeModal);
    
    // Закрытие модалки при клике вне контента
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    const handleEscape = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
        
        if (event.key === 'Tab' && !modal.hidden) {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
    
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    };
    
    // 4. Взаимодействие с галереей
    const galleryContainer = document.getElementById('art-gallery-container');
    
    // Загрузка сохраненных лайков
    function loadSavedLikes() {
        document.querySelectorAll('.art-card').forEach(card => {
            const artId = card.dataset.id;
            const likeBtn = card.querySelector('.like-btn');
            const isLiked = localStorage.getItem(`like-${artId}`) === 'true';
            
            if (isLiked) {
                likeBtn.classList.add('liked');
                likeBtn.setAttribute('aria-label', 'Убрать лайк');
                likeBtn.textContent = '❤️';
            }
        });
    }
    
    // Создание сердечек
    function createHearts(count) {
        const hearts = ['❤️', '💙', '💚', '💛', '💜', '🧡', '🤍', '💖'];
        
        for (let i = 0; i < count; i++) {
            const heart = document.createElement('div');
            heart.className = 'undertale-heart';
            heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
            
            // Позиционирование
            const startX = Math.random() * window.innerWidth;
            const startY = window.innerHeight + 50;
            const endY = -100;
            const duration = 2 + Math.random() * 1;
            const rotation = Math.random() * 360;
            
            heart.style.position = 'fixed';
            heart.style.left = startX + 'px';
            heart.style.top = startY + 'px';
            heart.style.fontSize = (20 + Math.random() * 30) + 'px';
            heart.style.opacity = '1';
            heart.style.zIndex = '10000';
            heart.style.pointerEvents = 'none';
            heart.style.transform = `rotate(${rotation}deg)`;
            
            document.body.appendChild(heart);
            
            // Анимация
            heart.animate([
                { 
                    transform: `translateY(0) rotate(${rotation}deg) scale(1)`,
                    opacity: 1 
                },
                { 
                    transform: `translateY(${endY}px) rotate(${rotation + 360}deg) scale(0)`,
                    opacity: 0 
                }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            });
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.remove();
                }
            }, duration * 1000);
        }
    }
    
    // Обработчик взаимодействий с галереей
    function handleGalleryInteraction(event) {
        const target = event.target;
        const card = target.closest('.art-card');
        
        if (!card) return;
        
        const artId = card.dataset.id;
        
        // Лайки
        if (target.dataset.action === 'like') {
            event.preventDefault();
            event.stopPropagation();
            
            target.classList.toggle('liked');
            const isLiked = target.classList.contains('liked');
            target.setAttribute('aria-label', isLiked ? 'Убрать лайк' : 'Нравится');
            target.textContent = isLiked ? '❤️' : '🤍';
            
            localStorage.setItem(`like-${artId}`, isLiked);
            
            // Создаем сердечки при лайке
            if (isLiked) {
                createHearts(5);
                
                // Анимация карточки
                card.style.animation = 'heartBeat 0.5s';
                setTimeout(() => {
                    card.style.animation = '';
                }, 500);
            }
        }
        
        // Открытие модального окна
        if (target.dataset.action === 'open-modal' || target.classList.contains('art-image')) {
            event.preventDefault();
            const imgSrc = target.src;
            const title = card.querySelector('h3').textContent;
            openModal(imgSrc, title, artId, card);
        }
    }
    
    galleryContainer.addEventListener('click', handleGalleryInteraction);
    galleryContainer.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            handleGalleryInteraction(event);
            event.preventDefault();
        }
    });
    
    // 5. Валидация формы
    const form = document.getElementById('main-contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const resultDisplay = document.getElementById('submission-result');
    
    const checkCustomValidity = (input) => {
        const minLength = input.dataset.minLength;
        
        if (minLength && input.value.length < parseInt(minLength) && input.value.length > 0) { 
            if (input.id === 'message') {
                const remaining = parseInt(minLength) - input.value.length;
                return `Сообщение должно содержать минимум ${minLength} символов. Осталось: ${remaining}`;
            }
            return 'Поле слишком короткое.';
        }
        
        // Проверка email
        if (input.id === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                return 'Пожалуйста, введите корректный адрес электронной почты.';
            }
        }
        
        return ''; 
    };
    
    const displayError = (input, message) => {
        const errorSpan = input.nextElementSibling; 
        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.textContent = message;
            input.setAttribute('aria-invalid', message !== ''); 
            
            // Добавляем/убираем класс ошибки
            if (message) {
                input.classList.add('error');
                errorSpan.style.display = 'block';
            } else {
                input.classList.remove('error');
                errorSpan.style.display = 'none';
            }
        }
    };
    
    const checkFormValidity = () => {
        const requiredInputs = form.querySelectorAll('[required]');
        let isFormValid = true;
        
        requiredInputs.forEach(input => {
            if (!input.checkValidity() || checkCustomValidity(input) !== '') {
                isFormValid = false;
            }
        });
        
        // Проверка выбора темы
        const subject = form.querySelector('#subject');
        if (subject && !subject.value) {
            isFormValid = false;
            subject.setAttribute('aria-invalid', 'true');
        }
        
        return isFormValid;
    };
    
    // Реальная валидация при вводе
    form.addEventListener('input', (event) => {
        const input = event.target;
        let errorMessage = '';
    
        if (input.hasAttribute('required') && !input.value.trim()) {
            errorMessage = 'Это поле обязательно для заполнения.';
        } 
        else if (!input.checkValidity()) {
            errorMessage = input.validationMessage;
            if (input.id === 'email' && input.validity.typeMismatch) {
                errorMessage = 'Пожалуйста, введите корректный адрес электронной почты (например, user@example.com).';
            }
        } 
        else {
            errorMessage = checkCustomValidity(input);
        }
        
        displayError(input, errorMessage);
        submitBtn.disabled = !checkFormValidity();
        
        // Обновляем счетчик символов для textarea
        if (input.id === 'message' && input.dataset.minLength) {
            const charCount = input.value.length;
            const minLength = parseInt(input.dataset.minLength);
            const counter = input.parentElement.querySelector('.char-counter') || 
                           (() => {
                               const counter = document.createElement('div');
                               counter.className = 'char-counter';
                               input.parentElement.appendChild(counter);
                               return counter;
                           })();
            
            counter.textContent = `${charCount}/${minLength} символов`;
            counter.style.color = charCount >= minLength ? 'var(--undertale-green)' : 
                                 charCount === 0 ? 'var(--secondary-color)' : 
                                 'var(--error-color)';
        }
    });
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        
        // Триггерим валидацию всех полей
        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
    
        if (checkFormValidity()) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Симуляция отправки на сервер
            submitBtn.disabled = true;
            submitBtn.innerHTML = '🔄 Отправка...';
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            resultDisplay.textContent = '✅ Спасибо! Ваше сообщение успешно отправлено. Мы ответим вам в ближайшее время.';
            resultDisplay.style.color = 'var(--undertale-green)';
            
            // Создаем сердечки при успешной отправке
            createHearts(12);
            
            form.reset(); 
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Отправить сообщение';
            
            // Прокручиваем к результату
            resultDisplay.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
            
            // Сбрасываем счетчики символов
            form.querySelectorAll('.char-counter').forEach(counter => {
                counter.remove();
            });
        } else {
            resultDisplay.textContent = '❌ Пожалуйста, исправьте ошибки в форме.';
            resultDisplay.style.color = 'var(--error-color)';
            
            const firstInvalid = form.querySelector('[aria-invalid="true"]');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
                firstInvalid.focus();
            }
        }
    });
    
    // 6. Плавная прокрутка для навигации
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Обновляем URL без перезагрузки
                history.pushState(null, null, targetId);
                
                // Закрываем меню на мобильных
                if (navList.classList.contains('open')) {
                    menuToggle.click();
                }
            }
        });
    });
    
    // 7. Обработка кнопки "Наверх"
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // Создание кнопки "Наверх"
    function createScrollToTopButton() {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Наверх');
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 100;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        scrollBtn.addEventListener('click', scrollToTop);
        document.body.appendChild(scrollBtn);
        
        // Показ/скрытие кнопки при прокрутке
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 500) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.transform = 'translateY(0)';
                scrollBtn.style.pointerEvents = 'auto';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.transform = 'translateY(20px)';
                scrollBtn.style.pointerEvents = 'none';
            }
        });
    }
    
    // 8. Анимация при загрузке
    function initializeAnimations() {
        // Анимация появления элементов
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Наблюдаем за всеми карточками и секциями
        document.querySelectorAll('.art-card, .feature, .character-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
        
        // Постепенное появление
        document.querySelectorAll('.art-card').forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
        });
        
        document.querySelectorAll('.feature').forEach((feature, index) => {
            feature.style.transitionDelay = `${index * 0.15}s`;
        });
    }
    
    // 9. Инициализация всех функций
    function init() {
        loadSavedLikes();
        createScrollToTopButton();
        initializeAnimations();
        
        // Установка начального состояния кнопки отправки
        submitBtn.disabled = !checkFormValidity();
        
        // Добавляем обработчик изменения темы для select
        const subjectSelect = form.querySelector('#subject');
        if (subjectSelect) {
            subjectSelect.addEventListener('change', () => {
                subjectSelect.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }
        
        // Инициализация счетчиков символов
        const messageTextarea = form.querySelector('#message');
        if (messageTextarea) {
            messageTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        console.log('Undertale Fan Art Gallery инициализирован! 🎮');
    }
    
    // Запуск инициализации
    init();
    
    // 10. Дополнительные улучшения
    window.addEventListener('load', () => {
        // Предзагрузка изображений
        const images = document.querySelectorAll('.art-image');
        images.forEach(img => {
            const tempImg = new Image();
            tempImg.src = img.src;
        });
        
        // Анимация для логотипа
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('mouseenter', () => {
                logo.style.transform = 'scale(1.1)';
                logo.style.transition = 'transform 0.3s ease';
            });
            
            logo.addEventListener('mouseleave', () => {
                logo.style.transform = 'scale(1)';
            });
        }
    });
    
    // Обработка изменений темы для динамического обновления
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'data-theme') {
                // Обновляем стили, если нужно
                document.querySelectorAll('.scroll-to-top').forEach(btn => {
                    btn.style.background = `linear-gradient(135deg, var(--primary-color), var(--secondary-color))`;
                });
            }
        });
    });
    
    themeObserver.observe(document.documentElement, { attributes: true });
});