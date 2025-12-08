const handleClickImg = (e) => {
  // Переключаем класс у элемента, на который кликнули
  e.target.classList.toggle('memes__img--open');

  // Если нужно управлять другим элементом (например, кнопкой закрытия)
  if (e.target.classList.contains('memes__img--open')) {
    // Правильное обращение к document
    const closeBtn = document.querySelector('.closePhoto');
    if (closeBtn) {
      closeBtn.classList.add('close-btn--visible'); // Лучше отдельный класс
    }
  } else {
    const closeBtn = document.querySelector('.closePhoto');
    if (closeBtn) {
      closeBtn.classList.remove('close-btn--visible');
    }
  }
}

const handleClickLike = (e) => {
  e.target.classList.toggle('memes__like--liked');

  // Исправляем has на classList.contains
  if (e.target.classList.contains('memes__like--liked')) {
    // Логика когда лайк активен
    e.target.textContent = '❤️ Оценено';
    // Можно добавить отправку на сервер и т.д.
  } else {
    // Логика когда лайк не активен
    e.target.textContent = 'Оценить';
  }
}

const closePhoto = (e) => {
  // Закрываем все открытые изображения
  const openImages = document.querySelectorAll('.memes__img--open');
  openImages.forEach(img => {
    img.classList.remove('memes__img--open');
  });

  // Скрываем кнопку закрытия
  const closeBtn = document.querySelector('.closePhoto');
  if (closeBtn) {
    closeBtn.classList.remove('close-btn--visible');
  }
}