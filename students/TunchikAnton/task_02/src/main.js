const root = document.documentElement;

// -------------------- Тема --------------------
const savedTheme = localStorage.getItem('theme') || 'light';
root.dataset.theme = savedTheme;

// Обновляем иконку темы
function updateThemeIcon() {
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = root.dataset.theme === 'dark' ? '☀️' : '🌙';
  }
}

document.querySelector('.theme-toggle').addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', root.dataset.theme);
  updateThemeIcon();
});

updateThemeIcon();

// -------------------- LocalStorage Manager --------------------
class StorageManager {
  constructor() {
    this.likesKey = 'gadget_likes';
    this.activeTabKey = 'gadget_active_tab';
    this.likedCardsKey = 'gadget_liked_cards';
  }

  // Лайки
  getLikes() {
    const likes = localStorage.getItem(this.likesKey);
    return likes ? JSON.parse(likes) : {};
  }

  saveLikes(likes) {
    localStorage.setItem(this.likesKey, JSON.stringify(likes));
  }

  updateLike(deviceId, increment = true) {
    const likes = this.getLikes();
    if (!likes[deviceId]) {
      likes[deviceId] = 0;
    }
    likes[deviceId] += increment ? 1 : -1;
    if (likes[deviceId] < 0) likes[deviceId] = 0;
    this.saveLikes(likes);
    return likes[deviceId];
  }

  // Активная вкладка
  getActiveTab() {
    return localStorage.getItem(this.activeTabKey) || 'apple';
  }

  saveActiveTab(tab) {
    localStorage.setItem(this.activeTabKey, tab);
  }

  // Лайкнутые карточки
  getLikedCards() {
    const liked = localStorage.getItem(this.likedCardsKey);
    return liked ? JSON.parse(liked) : {};
  }

  saveLikedCards(likedCards) {
    localStorage.setItem(this.likedCardsKey, JSON.stringify(likedCards));
  }

  toggleCardLike(deviceId) {
    const likedCards = this.getLikedCards();
    likedCards[deviceId] = !likedCards[deviceId];
    this.saveLikedCards(likedCards);
    return likedCards[deviceId];
  }

  getCardLikeStatus(deviceId) {
    const likedCards = this.getLikedCards();
    return !!likedCards[deviceId];
  }
}

// -------------------- Основной код --------------------
document.addEventListener('DOMContentLoaded', () => {
  const storage = new StorageManager();
  const tabs = document.querySelector('.tabs');
  const cardsContainer = document.getElementById('cards');
  const noCards = document.getElementById('no-cards');

  // -------------------- Табы --------------------
  const savedBrand = storage.getActiveTab();
  setBrand(savedBrand);

  tabs.addEventListener('click', e => {
    const tab = e.target.closest('.tab-button');
    if (tab && tab.hasAttribute('data-brand')) {
      setBrand(tab.dataset.brand);
    }
  });

  function setBrand(brand) {
    document.querySelectorAll('.tab-button').forEach(tab => {
      const selected = tab.dataset.brand === brand;
      tab.setAttribute('aria-selected', selected);
      tab.classList.toggle('active', selected);
      tab.tabIndex = selected ? 0 : -1;
    });

    const cards = cardsContainer.querySelectorAll('.card');
    let visible = 0;
    cards.forEach(card => {
      const show = card.dataset.brand === brand;
      card.hidden = !show;
      if (show) visible++;
    });

    noCards.hidden = visible > 0;
    storage.saveActiveTab(brand);
  }

  // -------------------- Лайки --------------------
  function updateLikeDisplay(card, deviceId) {
    const likeBtn = card.querySelector('.like-button');
    const countEl = card.querySelector('.like-count');
    const likes = storage.getLikes();
    const isLiked = storage.getCardLikeStatus(deviceId);
    
    countEl.textContent = likes[deviceId] || 0;
    
    if (isLiked) {
      likeBtn.classList.add('liked');
    } else {
      likeBtn.classList.remove('liked');
    }
  }

  // Инициализация лайков
  cardsContainer.querySelectorAll('.card').forEach(card => {
    const deviceId = card.dataset.id;
    const likes = storage.getLikes();
    if (!likes[deviceId]) {
      likes[deviceId] = 0;
      storage.saveLikes(likes);
    }
    updateLikeDisplay(card, deviceId);
  });

  // -------------------- Делегирование кликов --------------------
  cardsContainer.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const deviceId = card.dataset.id;
    const actionButton = e.target.closest('[data-action]');
    
    if (!actionButton) return;
    const action = actionButton.dataset.action;

    if (action === 'like') {
      const wasLiked = storage.getCardLikeStatus(deviceId);
      const newLikedState = storage.toggleCardLike(deviceId);
      
      // Обновляем счетчик
      const currentCount = parseInt(storage.getLikes()[deviceId] || 0);
      if (newLikedState && !wasLiked) {
        storage.updateLike(deviceId, true);
      } else if (!newLikedState && wasLiked) {
        storage.updateLike(deviceId, false);
      }
      
      updateLikeDisplay(card, deviceId);
      return;
    }

    if (action === 'delete') {
      if (confirm('Удалить эту карточку?')) {
        const likes = storage.getLikes();
        delete likes[deviceId];
        storage.saveLikes(likes);
        
        const likedCards = storage.getLikedCards();
        delete likedCards[deviceId];
        storage.saveLikedCards(likedCards);
        
        card.remove();
        const currentBrand = storage.getActiveTab();
        const remaining = cardsContainer.querySelectorAll(`.card[data-brand="${currentBrand}"]:not([hidden])`);
        noCards.hidden = remaining.length > 0;
      }
      return;
    }
  });

  // -------------------- Форма --------------------
  const form = document.querySelector('form');
  const submitBtn = form.querySelector('.submit-button');
  const result = document.querySelector('.form-result');

  const rules = {
    name: {
      validate: v => v.trim().length > 0,
      message: 'Имя обязательно'
    },
    email: {
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Введите корректный email'
    },
    message: {
      validate: v => v.trim().length >= 20,
      message: 'Минимум 20 символов'
    }
  };

  function validateField(field) {
    const rule = rules[field.name];
    if (!rule) return true;
    
    const isValid = rule.validate(field.value);
    const errorEl = field.nextElementSibling;
    
    if (!isValid && field.value) {
      errorEl.textContent = rule.message;
      field.setAttribute('aria-invalid', 'true');
    } else {
      errorEl.textContent = '';
      field.removeAttribute('aria-invalid');
    }
    
    return isValid;
  }

  function validateForm() {
    const fields = Array.from(form.elements).filter(el => rules[el.name]);
    const isValid = fields.every(field => validateField(field) && field.value.trim());
    submitBtn.disabled = !isValid;
    return isValid;
  }

  form.addEventListener('input', (e) => {
    if (rules[e.target.name]) {
      validateField(e.target);
      validateForm();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="button-text">Отправка...</span>';
    
    // Имитация отправки
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    result.textContent = 'Сообщение успешно отправлено!';
    result.style.display = 'block';
    
    form.reset();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="button-text">Отправить сообщение</span><span class="button-icon">→</span>';
    
    setTimeout(() => {
      result.style.display = 'none';
    }, 3000);
  });

  // -------------------- Тесты (скрытые) --------------------
  function runHiddenTests() {
    const tests = [
      {
        name: 'LocalStorage сохраняет тему',
        test: () => {
          localStorage.setItem('theme', 'dark');
          return localStorage.getItem('theme') === 'dark';
        }
      },
      {
        name: 'LocalStorage сохраняет вкладку',
        test: () => {
          storage.saveActiveTab('samsung');
          return storage.getActiveTab() === 'samsung';
        }
      },
      {
        name: 'LocalStorage сохраняет лайки',
        test: () => {
          const testLikes = { testDevice: 5 };
          storage.saveLikes(testLikes);
          return storage.getLikes().testDevice === 5;
        }
      },
      {
        name: 'LocalStorage сохраняет статус лайков',
        test: () => {
          storage.toggleCardLike('testDevice');
          return storage.getCardLikeStatus('testDevice') === true;
        }
      }
    ];

    let passed = 0;
    tests.forEach(test => {
      try {
        if (test.test()) passed++;
      } catch (e) {
        console.error('Test failed:', test.name, e);
      }
    });

    console.log(`✅ Скрытые тесты: ${passed}/${tests.length} пройдено`);
  }

  // Запуск скрытых тестов
  setTimeout(runHiddenTests, 1000);
});