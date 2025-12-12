import { getList, getDetail, createItem, updateItem, deleteItem, register, login, logout } from './api.js';  /* Добавили register */

let prefetchCache = {};

window.prefetchDetail = async function(id) {
  if (!prefetchCache[id]) {
    try {
      prefetchCache[id] = await getDetail(id);
    } catch {}
  }
};

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = type;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function renderLoading() {
  return '<div class="loading">Загрузка...</div>';
}

function renderError(error) {
  return `<div class="error">Ошибка: ${error.message}</div>`;
}

function renderEmpty() {
  return '<div class="empty">Страна не найдена! 😔</div>';
}

function renderNav() {
  const token = localStorage.getItem('token');
  return `
    <nav class="top-row">
      <div class="brand">
        <div class="logo"></div>
        <span>Справочник мест для путешествий</span>
      </div>
      <div class="nav-actions">
        <button class="btn-primary" onclick="location.hash='#/destinations'">Список</button>
        ${token ? `
          <button class="btn-primary" onclick="location.hash='#/new'">Создать</button>
          <button class="btn-primary" onclick="logoutAndRedirect()">Выйти</button>
        ` : `<button class="btn-primary" onclick="location.hash='#/auth'">Войти / Регистрация</button>`}
      </div>
    </nav>
  `;
}

window.logoutAndRedirect = function() {
  logout();
  location.hash = '#/destinations';
  navigate();
};

export async function listView({ params, query }) {
  const app = document.getElementById('app');
  app.innerHTML = renderNav() + renderLoading();

  try {
    const searchInput = query.get('search') || '';
    const sort = query.get('sort') || 'asc';
    const apiQuery = new URLSearchParams({ q: searchInput }).toString();
    let items = await getList(apiQuery);

    // Client-side fallback filtering (ensure search always works)
    if (searchInput && Array.isArray(items)) {
      const term = searchInput.toLowerCase();
      items = items.filter(i => (i.name || '').toLowerCase().includes(term) || (i.location || '').toLowerCase().includes(term));
    }

    items.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sort === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

    let html = `
      <form id="searchForm" class="search-form">
        <input type="text" placeholder="Поиск..." value="${searchInput}">
        <select>
          <option value="asc" ${sort === 'asc' ? 'selected' : ''}>A-Z</option>
          <option value="desc" ${sort === 'desc' ? 'selected' : ''}>Z-A</option>
        </select>
        <button type="submit">Искать</button>
      </form>
      <ul class="country-list">
    `;
    if (items.length === 0) {
      html += renderEmpty();
    } else {
      items.forEach(item => {
        html += `
          <li>
            <a class="country-name" href="#/destinations/${item.id}" data-id="${item.id}">${item.name}</a>
            <p class="card-meta">${item.location}</p>
          </li>
        `;
      });
    }
    html += '</ul>';
    app.innerHTML = renderNav() + html;

    document.querySelectorAll('a[data-id]').forEach(link => {
      link.addEventListener('mouseover', () => {
        const id = link.dataset.id;
        prefetchDetail(id);
      });
    });

    const form = document.getElementById('searchForm');
    const input = form.querySelector('input');
    const select = form.querySelector('select');

    // Debounce helper
    function debounce(fn, ms = 300){ let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), ms); }; }

    const doSearch = debounce(() => {
      const newSearch = input.value;
      const newSort = select.value;
      location.hash = `#/destinations?search=${encodeURIComponent(newSearch)}&sort=${newSort}`;
    }, 250);

    input.addEventListener('input', doSearch);

    form.addEventListener('submit', e => {
      e.preventDefault();
      doSearch();
    });
  } catch (error) {
    app.innerHTML = renderNav() + renderError(error);
  }
}

export async function detailView({ params }) {
  const app = document.getElementById('app');
  app.innerHTML = renderNav() + renderLoading();

  try {
    const item = prefetchCache[params.id] || await getDetail(params.id);
    delete prefetchCache[params.id];
    if (!item) throw new Error('Not found');

    app.innerHTML = renderNav() + `
      <h1>${item.name}</h1>
      <p>Локация: ${item.location}</p>
      <p>${item.description}</p>
      <button onclick="location.hash='#/destinations/${params.id}/edit'">Редактировать</button>
      <button onclick="confirmDelete(${params.id})">Удалить</button>
      <a href="#/destinations">Назад</a>
    `;
  } catch (error) {
    let msg = 'Ошибка загрузки детали. Проверьте соединение или ID.';
    if (error.message.includes('404')) {
      msg = 'Место не найдено (404). Вернитесь в список или обновите данные! 😔';
    }
    app.innerHTML = renderNav() + renderError(new Error(msg));
  }
}

window.confirmDelete = async function(id) {
  if (confirm('Подтвердите удаление')) {
    try {
      await deleteItem(id);
      showToast('Удалено успешно');
      location.hash = '#/destinations';
    } catch (error) {
      showToast('Ошибка удаления', 'error');
    }
  }
};

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('input[required], textarea[required]').forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = 'red';
      valid = false;
    } else {
      field.style.borderColor = '';
    }
  });
  return valid;
}

export async function formView({ params, isEdit = false }) {
  const id = params?.id;
  const app = document.getElementById('app');
  app.innerHTML = renderNav() + renderLoading();

  let item = { name: '', description: '', location: '' };
  if (isEdit) {
    try {
      item = await getDetail(id);
    } catch {}
  }

  app.innerHTML = renderNav() + `
    <h1>${isEdit ? 'Редактировать' : 'Создать'} место</h1>
    <form id="itemForm">
      <input type="text" name="name" placeholder="Название" value="${item.name}" required minlength="3">
      <textarea name="description" placeholder="Описание" required>${item.description}</textarea>
      <input type="text" name="location" placeholder="Локация" value="${item.location}" required>
      <button type="submit" id="submitBtn">${isEdit ? 'Обновить' : 'Создать'}</button>
      <a href="#/destinations">Отмена</a>
    </form>
  `;

  const form = document.getElementById('itemForm');
  const btn = document.getElementById('submitBtn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(form)) return showToast('Заполните все поля', 'error');

    btn.disabled = true;
    const data = {
      name: form.name.value.trim(),
      description: form.description.value.trim(),
      location: form.location.value.trim(),
    };

    try {
      if (isEdit) {
        await updateItem(id, data);
        showToast('Обновлено успешно');
      } else {
        await createItem(data);
        showToast('Создано успешно');
      }
      location.hash = '#/destinations';
    } catch (error) {
      showToast('Ошибка операции', 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

export function authView() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Авторизация</h1>
    <div class="center-column">
      <button onclick="location.hash='#/login'">Вход</button>
      <button onclick="location.hash='#/register'">Регистрация</button>
    </div>
  `;
}

export function loginView() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Вход</h1>
    <form id="loginForm" class="login-form">
      <input type="text" name="username" placeholder="Логин" required>
      <input type="password" name="password" placeholder="Пароль" required>
      <button type="submit">Войти</button>
    </form>
    <a href="#/register">Нет аккаунта? Зарегистрироваться</a>
  `;

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      await login(username, password);
      showToast('Вход успешен');
      location.hash = '#/destinations';
    } catch (error) {
      showToast('Ошибка входа: ' + error.message, 'error');
    }
  });
}

export function registerView() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Регистрация</h1>
    <form id="registerForm" class="login-form">
      <input type="text" name="username" placeholder="Логин" required minlength="3">
      <input type="password" name="password" placeholder="Пароль" required minlength="6">
      <button type="submit">Зарегистрироваться</button>
    </form>
    <a href="#/login">Уже есть аккаунт? Войти</a>
  `;

  document.getElementById('registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      await register(username, password);
      showToast('Регистрация успешна! Вы вошли.');
      location.hash = '#/destinations';
    } catch (error) {
      showToast('Ошибка регистрации: ' + error.message, 'error');
    }
  });
}