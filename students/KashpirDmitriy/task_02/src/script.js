// script.js
console.log('JS загружается...'); // Добавлено для отладки

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM загружен!'); // Отладка

  // === Данные плейлистов ===
  const playlistsData = {
    'playlist-chill': [
      { id: 1, title: 'Lo-Fi Beats to Study/Relax', artist: 'Chillhop Music' },
      { id: 2, title: 'Midnight Stroll', artist: 'Unknown Artist' },
      { id: 3, title: 'Rainy Days', artist: 'Lofi Girl' }
    ],
    'playlist-rock': [
      { id: 4, title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
      { id: 5, title: 'Smells Like Teen Spirit', artist: 'Nirvana' },
      { id: 6, title: 'Stairway to Heaven', artist: 'Led Zeppelin' }
    ],
    'playlist-pop': [
      { id: 7, title: 'Blinding Lights', artist: 'The Weeknd' },
      { id: 8, title: 'Levitating', artist: 'Dua Lipa' },
      { id: 9, title: 'Watermelon Sugar', artist: 'Harry Styles' }
    ]
  };

  // === Загрузка лайков из localStorage ===
  const likedTracks = JSON.parse(localStorage.getItem('likedTracks') || '{}');

  // === Рендер всех плейлистов ===
  function renderPlaylists() {
    console.log('Рендер плейлистов...'); // Отладка
    Object.entries(playlistsData).forEach(([playlistId, tracks]) => {
      const container = document.getElementById(playlistId);
      if (!container) return;
      const ol = container.querySelector('.tracklist');
      ol.innerHTML = '';
      tracks.forEach(track => {
        const li = document.createElement('li');
        li.className = 'track';
        li.dataset.id = track.id;
        li.innerHTML = `
          <span class="track-title">${track.title}</span>
          <span class="track-artist">${track.artist}</span>
          <button class="play-btn" aria-label="Воспроизвести ${track.title}">▶️</button>
          <button class="like-btn" aria-pressed="${likedTracks[track.id] || false}" aria-label="Лайк ${track.title}">
            ${likedTracks[track.id] ? '❤️' : '♡'}
          </button>
        `;
        ol.appendChild(li);
      });
    });
  }
  renderPlaylists();

  // === Табы ===
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('Клик по табу:', btn.textContent); // Отладка
      const target = btn.getAttribute('aria-controls');
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.playlist').forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-hidden', 'true');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(target).classList.add('active');
      document.getElementById(target).setAttribute('aria-hidden', 'false');
    });
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // === Делегирование: лайки и воспроизведение ===
  const container = document.querySelector('.playlists-container');
  if (container) {
    container.addEventListener('click', e => {
      console.log('Клик в контейнере:', e.target); // Отладка
      const likeBtn = e.target.closest('.like-btn');
      if (likeBtn) {
        console.log('Лайк нажат!'); // Отладка
        const pressed = likeBtn.getAttribute('aria-pressed') === 'true';
        likeBtn.setAttribute('aria-pressed', !pressed);
        likeBtn.innerHTML = !pressed ? '❤️' : '♡';
        const trackId = likeBtn.closest('.track').dataset.id;
        if (!pressed) likedTracks[trackId] = true;
        else delete likedTracks[trackId];
        localStorage.setItem('likedTracks', JSON.stringify(likedTracks));
        return;
      }

      const playBtn = e.target.closest('.play-btn');
      if (playBtn) {
        console.log('Play нажат!'); // Отладка
        const trackEl = playBtn.closest('.track');
        const title = trackEl.querySelector('.track-title').textContent;
        const artist = trackEl.querySelector('.track-artist').textContent;
        const currentTrackEl = document.querySelector('.current-track');
        const currentArtistEl = document.querySelector('.current-artist');
        if (currentTrackEl && currentArtistEl) {
          currentTrackEl.textContent = title;
          currentArtistEl.textContent = artist;
        }
        openModal(document.getElementById('now-playing-modal'));
      }
    });
  } else {
    console.error('Контейнер .playlists-container не найден!'); // Отладка
  }

  // === Модальные окна ===
  const overlay = document.querySelector('.overlay');
  function openModal(modal) {
    console.log('Открытие модалки:', modal.id); // Отладка
    modal.setAttribute('aria-hidden', 'false');
    overlay.classList.add('active');
    const firstFocusable = modal.querySelector('button, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();
  }
  function closeModal(modal) {
    console.log('Закрытие модалки'); // Отладка
    modal.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('active');
  }

  document.querySelectorAll('.modal-close, .overlay').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.modal[aria-hidden="false"]').forEach(closeModal);
    });
  });

  const addBtn = document.querySelector('.add-track-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      console.log('Кнопка добавить трек нажата'); // Отладка
      openModal(document.getElementById('add-track-modal'));
    });
  }

  // Esc закрывает модалку
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal[aria-hidden="false"]').forEach(closeModal);
    }
  });

  // === Форма добавления трека с валидацией ===
  const form = document.querySelector('.add-track-form');
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');

    function validateField(field) {
      const errorEl = field.parentElement.querySelector('.error');
      if (!field.validity.valid) {
        if (field.validity.valueMissing) errorEl.textContent = 'Обязательное поле';
        else if (field.validity.tooShort) errorEl.textContent = `Минимум ${field.minLength} символа`;
        else errorEl.textContent = 'Некорректное значение';
      } else {
        errorEl.textContent = '';
      }
    }

    form.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', () => {
        validateField(input);
        submitBtn.disabled = !form.checkValidity();
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      console.log('Форма отправлена!'); // Отладка
      if (!form.checkValidity()) return;

      const title = form.title.value.trim();
      const artist = form.artist.value.trim();
      const playlistId = form.playlist.value;
      const newId = Date.now();

      const newTrack = { id: newId, title, artist };
      playlistsData[playlistId].push(newTrack);
      renderPlaylists();
      form.reset();
      submitBtn.disabled = true;
      closeModal(document.getElementById('add-track-modal'));
    });
  } else {
    console.error('Форма не найдена!'); // Отладка
  }

  // === Переключение тёмной темы ===
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      console.log('Переключение темы'); // Отладка
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      themeBtn.innerHTML = isDark ? '☀️' : '🌙';
    });
  }

  console.log('JS инициализирован!'); // Отладка
});