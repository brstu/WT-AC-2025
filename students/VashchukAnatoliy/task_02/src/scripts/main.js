/* jshint esversion: 6 */
// ================================
// Lab 02 - Основной JavaScript файл
// ================================

const modal = document.getElementById('imageModal');

// Данные мемов (в реальном проекте могли бы приходить с сервера)
const memeData = [
  {
    id: 1,
    title: "Умный человек в очках",
    image: "assets/umni.webp",
    fallback: "assets/umni.jpg",
    description: "Шутка в стиле интернет-обоев, мем для умных людей.",
    likes: 42,
    liked: false
  },
  {
    id: 2,
    title: "ОКАК",
    image: "assets/okak.webp", 
    fallback: "assets/okak.jpg",
    description: "Шутливая реакция на абсурдные события и ситуации.",
    likes: 38,
    liked: false
  },
  {
    id: 3,
    title: "Итальянский брейнрот",
    image: "assets/trala.webp",
    fallback: "assets/trala.jpg",
    description: "Комичное изображение, иллюстрирующее абсурдное мышление.",
    likes: 29,
    liked: false
  }
];

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();
  initializeMemeCards();
  initializeAccordion();
  initializeTabs();
  initializeModal();
  initializeForm();
  loadLikesFromStorage();
});

// ========== ТЕМА ==========
function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Проверка сохранённой темы или системной (prefers-color-scheme)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    body.classList.add('dark');
    themeToggle.textContent = '☀️';
    themeToggle.setAttribute('aria-pressed', 'true');
  } else {
    themeToggle.textContent = '🌙';
    themeToggle.setAttribute('aria-pressed', 'false');
  }

  // Обработчик клика на кнопку
  themeToggle.addEventListener('click', function() {
    body.classList.toggle('dark');
    const isDark = body.classList.contains('dark');
    themeToggle.setAttribute('aria-pressed', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // Слушаем изменения системной темы
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      const isDark = e.matches;
      body.classList.toggle('dark', isDark);
      themeToggle.setAttribute('aria-pressed', isDark);
      themeToggle.textContent = isDark ? '☀️' : '🌙';
    }
  });
}

// ========== КОМПОНЕНТ: КАРТОЧКИ МЕМОВ С ЛАЙКАМИ ==========
function initializeMemeCards() {
  const container = document.getElementById('meme-cards-container');
  
  // Генерация карточек
  container.innerHTML = memeData.map(meme => `
    <article class="meme-card" data-meme-id="${meme.id}" tabindex="0">
      <div class="media">
        <picture>
          <source srcset="${meme.image}" type="image/webp">
          <img src="${meme.fallback}" alt="${meme.description}" loading="lazy">
        </picture>
      </div>
      <button class="like-button" data-like="${meme.id}" aria-pressed="${meme.liked}">
        ♥ <span class="like-count">${meme.likes}</span>
      </button>
      <div class="card-body">
        <h3>${meme.title}</h3>
        <p class="description">${meme.description}</p>
      </div>
    </article>
  `).join('');

  // Делегирование событий для лайков и открытия модалки
  container.addEventListener('click', function(e) {
    const likeButton = e.target.closest('[data-like]');
    const memeCard = e.target.closest('.meme-card');
    const memeImage = e.target.closest('.meme-card img');
    
    if (likeButton) {
      e.stopPropagation();
      handleLikeClick(likeButton);
    } else if (memeImage || memeCard) {
      openMemeModal(memeCard.dataset.memeId);
    }
  });

  // Обработка клавиатурных событий для карточек
  container.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const memeCard = e.target.closest('.meme-card');
      if (memeCard && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        openMemeModal(memeCard.dataset.memeId);
      }
    }
  });
}

function handleLikeClick(button) {
  const memeId = button.dataset.like;
  const meme = memeData.find(m => m.id == memeId);
  
  if (meme) {
    meme.liked = !meme.liked;
    meme.likes += meme.liked ? 1 : -1;
    
    button.classList.toggle('liked', meme.liked);
    button.setAttribute('aria-pressed', meme.liked);
    button.querySelector('.like-count').textContent = meme.likes;
    
    saveLikesToStorage();
  }
}

// ========== КОМПОНЕНТ: АККОРДЕОН ==========
function initializeAccordion() {
  const accordion = document.querySelector('.accordion');
  
  accordion.addEventListener('click', function(e) {
    const button = e.target.closest('.accordion-button');
    if (!button) return;
    
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    
    // Закрываем все панели
    document.querySelectorAll('.accordion-panel').forEach(p => {
      p.hidden = true;
    });
    document.querySelectorAll('.accordion-button').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
    });
    
    // Открываем текущую, если была закрыта
    if (!isExpanded) {
      button.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    }
  });

  // Обработка клавиатуры для аккордеона
  accordion.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.target.click();
    }
  });
}

// ========== КОМПОНЕНТ: ТАБЫ ==========
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetPanel = this.getAttribute('aria-controls');
      
      // Обновляем состояния кнопок
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      
      // Обновляем панели
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.hidden = true;
      });
      
      const activePanel = document.getElementById(targetPanel);
      activePanel.classList.add('active');
      activePanel.hidden = false;
    });
  });

  // Клавиатурная навигация по табам
  document.querySelector('.tabs').addEventListener('keydown', function(e) {
    const currentTab = e.target;
    const tabs = Array.from(tabButtons);
    const currentIndex = tabs.indexOf(currentTab);
    
    let nextIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }
    
    e.preventDefault();
    tabs[nextIndex].click();
    tabs[nextIndex].focus();
  });
}

// ========== КОМПОНЕНТ: МОДАЛЬНОЕ ОКНО ==========
function initializeModal() {
  const modal = document.getElementById('meme-modal');
  const closeButton = document.getElementById('modal-close');
  
  // Закрытие модалки
  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });
  
  // Клавиатурные события
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display !== 'none') {
      closeModal();
    }
  });
}

function openMemeModal(memeId) {
  const meme = memeData.find(m => m.id == memeId);
  if (!meme) return;
  
  const modal = document.getElementById('meme-modal');
  const modalImage = document.getElementById('modal-image');
  const modalDescription = document.getElementById('modal-description');
  
  modalImage.src = meme.image;
  modalImage.alt = meme.description;
  modalDescription.textContent = meme.description;
  
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  
  // Фокус на кнопку закрытия
  setTimeout(() => {
    document.getElementById('modal-close').focus();
  }, 100);
}

function closeModal() {
  const modal = document.getElementById('meme-modal');
  modal.hidden = true;
  document.body.style.overflow = '';
}

// ========== КОМПОНЕНТ: ФОРМА ==========
function initializeForm() {
  const form = document.getElementById('meme-form');
  const inputs = form.querySelectorAll('input, textarea');
  const submitButton = document.getElementById('submit-btn');
  
  // Валидация при вводе
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      validateField(this);
      updateSubmitButton();
    });
    
    input.addEventListener('blur', function() {
      validateField(this);
    });
  });
  
  // Отправка формы
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (validateForm()) {
      handleFormSubmit();
    }
  });
}

function validateField(field) {
  const errorElement = document.getElementById(field.id + '-error');
  let isValid = true;
  let message = '';
  
  if (field.validity.valueMissing) {
    isValid = false;
    message = 'Это поле обязательно для заполнения';
  } else if (field.type === 'email' && field.validity.typeMismatch) {
    isValid = false;
    message = 'Введите корректный email адрес';
  } else if (field.id === 'message' && field.validity.tooShort) {
    isValid = false;
    message = `Минимум ${field.minLength} символов (сейчас: ${field.value.length})`;
  }
  
  field.setAttribute('aria-invalid', !isValid);
  errorElement.textContent = message;
  
  return isValid;
}

function validateForm() {
  const fields = document.querySelectorAll('#meme-form [required]');
  let isValid = true;
  
  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  return isValid;
}

function updateSubmitButton() {
  const submitButton = document.getElementById('submit-btn');
  const isValid = validateForm();
  submitButton.disabled = !isValid;
}

function handleFormSubmit() {
  const form = document.getElementById('meme-form');
  const formData = new FormData(form);
  const resultElement = document.getElementById('form-result');
  
  // Имитация отправки
  setTimeout(() => {
    resultElement.textContent = 'Спасибо! Ваш мем отправлен на модерацию.';
    resultElement.className = 'success';
    form.reset();
    updateSubmitButton();
    
    // Сохраняем в localStorage
    const submission = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      timestamp: new Date().toISOString()
    };
    saveFormSubmission(submission);
  }, 1000);
}

// ========== LOCALSTORAGE ==========
function saveLikesToStorage() {
  const likesData = memeData.reduce((acc, meme) => {
    acc[meme.id] = { liked: meme.liked, likes: meme.likes };
    return acc;
  }, {});
  
  localStorage.setItem('memeLikes', JSON.stringify(likesData));
}

function loadLikesFromStorage() {
  const savedLikes = localStorage.getItem('memeLikes');
  if (savedLikes) {
    const likesData = JSON.parse(savedLikes);
    
    memeData.forEach(meme => {
      if (likesData[meme.id]) {
        meme.liked = likesData[meme.id].liked;
        meme.likes = likesData[meme.id].likes;
        
        const likeButton = document.querySelector(`[data-like="${meme.id}"]`);
        if (likeButton) {
          likeButton.classList.toggle('liked', meme.liked);
          likeButton.setAttribute('aria-pressed', meme.liked);
          likeButton.querySelector('.like-count').textContent = meme.likes;
        }
      }
    });
  }
}

function saveFormSubmission(submission) {
  const submissions = JSON.parse(localStorage.getItem('memeSubmissions') || '[]');
  submissions.push(submission);
  localStorage.setItem('memeSubmissions', JSON.stringify(submissions));
}