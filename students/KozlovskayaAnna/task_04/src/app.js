// Главный файл приложения: роутер, состояния, логика работы SPA
import { api } from './api.js';

// ============ СОСТОЯНИЯ UI ============
const UIStates = {
  LOADING: 'loading',
  ERROR: 'error',
  EMPTY: 'empty',
  SUCCESS: 'success',
};

// ============ УТИЛИТЫ ============

/**
 * Парсинг текущего hash-маршрута
 * @returns {Object} { path, params, query }
 */
function parseRoute() {
  const hash = window.location.hash.slice(1) || '/projects';
  const [pathWithQuery, ...rest] = hash.split('?');
  const queryString = rest.join('?');
  const query = new URLSearchParams(queryString);
  
  const pathParts = pathWithQuery.split('/').filter(Boolean);
  
  return {
    path: pathWithQuery,
    parts: pathParts,
    query: Object.fromEntries(query.entries()),
  };
}

/**
 * Навигация на другой маршрут
 */
function navigate(path, queryParams = {}) {
  const query = new URLSearchParams(queryParams).toString();
  window.location.hash = query ? `${path}?${query}` : path;
}

/**
 * Установить состояние UI в контейнере
 */
function setUIState(container, state, message = '') {
  container.innerHTML = '';
  container.className = `state-${state}`;
  
  if (state === UIStates.LOADING) {
    container.innerHTML = `
      <div class="spinner-container">
        <div class="spinner"></div>
        <p>Загрузка...</p>
      </div>
    `;
  } else if (state === UIStates.ERROR) {
    container.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h2>Произошла ошибка</h2>
        <p>${message || 'Не удалось загрузить данные'}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">
          Повторить
        </button>
      </div>
    `;
  } else if (state === UIStates.EMPTY) {
    container.innerHTML = `
      <div class="empty-container">
        <div class="empty-icon">📁</div>
        <h2>Проекты не найдены</h2>
        <p>Начните добавлять свои работы в портфолио</p>
        <button class="btn btn-primary" onclick="window.location.hash='/projects/new'">
          Добавить проект
        </button>
      </div>
    `;
  }
}

/**
 * Извлечь данные из формы
 */
function getFormData(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Обработка тегов (через запятую)
  if (data.tags) {
    data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
  } else {
    data.tags = [];
  }
  
  return data;
}

/**
 * Prefetch для детальной страницы (бонус)
 */
const prefetchCache = new Map();
function prefetchProject(id) {
  if (!prefetchCache.has(id)) {
    const promise = api.getProject(id).catch(() => null);
    prefetchCache.set(id, promise);
  }
}

// ============ СТРАНИЦЫ ============

/**
 * Страница списка проектов (#/projects)
 */
async function renderProjectsList(container, searchQuery = '') {
  setUIState(container, UIStates.LOADING);
  
  try {
    const projects = await api.listProjects(searchQuery);
    
    if (projects.length === 0) {
      setUIState(container, UIStates.EMPTY);
      return;
    }
    
    container.className = 'projects-list';
    container.innerHTML = `
      <div class="search-bar">
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Поиск проектов..." 
          value="${searchQuery}"
        />
      </div>
      <div class="projects-grid" id="projectsGrid"></div>
    `;
    
    const grid = container.querySelector('#projectsGrid');
    
    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-image" style="background-image: url('${project.image || 'https://via.placeholder.com/400x300'}')"></div>
        <div class="project-content">
          <div class="project-header">
            <h3>${project.title}</h3>
            <span class="badge">${project.category || 'Прочее'}</span>
          </div>
          <p class="project-description">${project.description || ''}</p>
          <div class="project-tags">
            ${(project.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('')}
          </div>
          <div class="project-footer">
            <a href="#/projects/${project.id}" class="btn btn-sm">Подробнее</a>
            <span class="project-date">${new Date(project.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      `;
      
      // Prefetch при наведении (бонус)
      card.addEventListener('mouseenter', () => prefetchProject(project.id), { once: true });
      
      grid.appendChild(card);
    });
    
    // Поиск с сохранением в hash
    const searchInput = container.querySelector('#searchInput');
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const query = e.target.value.trim();
        navigate('/projects', query ? { q: query } : {});
      }, 300);
    });
    
  } catch (error) {
    setUIState(container, UIStates.ERROR, error.message);
  }
}

/**
 * Детальная страница проекта (#/projects/:id)
 */
async function renderProjectDetail(container, id) {
  setUIState(container, UIStates.LOADING);
  
  try {
    // Проверяем prefetch-кеш
    let project;
    if (prefetchCache.has(id)) {
      project = await prefetchCache.get(id);
      prefetchCache.delete(id);
    }
    
    if (!project) {
      project = await api.getProject(id);
    }
    
    container.className = 'project-detail';
    container.innerHTML = `
      <button class="btn btn-back" onclick="window.location.hash='/projects'">
        ← Назад к списку
      </button>
      
      <div class="detail-content">
        <div class="detail-image" style="background-image: url('${project.image || 'https://via.placeholder.com/800x600'}')"></div>
        
        <div class="detail-info">
          <div class="detail-header">
            <div>
              <h1>${project.title}</h1>
              <span class="badge badge-lg">${project.category || 'Прочее'}</span>
            </div>
            <div class="detail-actions">
              <button class="btn btn-secondary" onclick="window.location.hash='/projects/${id}/edit'">
                Редактировать
              </button>
              <button class="btn btn-danger" id="deleteBtn">
                Удалить
              </button>
            </div>
          </div>
          
          <div class="detail-meta">
            <span>📅 ${new Date(project.createdAt).toLocaleDateString('ru-RU')}</span>
            ${project.link ? `<a href="${project.link}" target="_blank" class="project-link">🔗 Открыть проект</a>` : ''}
          </div>
          
          <div class="detail-description">
            <h2>Описание</h2>
            <p>${project.description || 'Описание отсутствует'}</p>
          </div>
          
          ${project.tags && project.tags.length > 0 ? `
            <div class="detail-tags">
              <h3>Теги</h3>
              <div class="tags-list">
                ${project.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    // Обработчик удаления
    container.querySelector('#deleteBtn').addEventListener('click', async () => {
      if (!confirm('Вы уверены, что хотите удалить этот проект?')) return;
      
      try {
        await api.deleteProject(id);
        navigate('/projects');
      } catch (error) {
        alert('Ошибка удаления: ' + error.message);
      }
    });
    
  } catch (error) {
    setUIState(container, UIStates.ERROR, error.message);
  }
}

/**
 * Форма создания/редактирования проекта
 */
async function renderProjectForm(container, id = null) {
  const isEdit = !!id;
  let project = null;
  
  if (isEdit) {
    setUIState(container, UIStates.LOADING);
    try {
      project = await api.getProject(id);
    } catch (error) {
      setUIState(container, UIStates.ERROR, error.message);
      return;
    }
  }
  
  container.className = 'project-form-page';
  container.innerHTML = `
    <button class="btn btn-back" onclick="window.history.back()">
      ← Назад
    </button>
    
    <div class="form-container">
      <h1>${isEdit ? 'Редактировать проект' : 'Новый проект'}</h1>
      
      <form id="projectForm" class="project-form">
        <div class="form-group">
          <label for="title">Название проекта *</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            required 
            value="${project?.title || ''}"
            placeholder="Например: Landing Page для кафе"
          />
        </div>
        
        <div class="form-group">
          <label for="category">Категория</label>
          <select id="category" name="category">
            <option value="Web" ${project?.category === 'Web' ? 'selected' : ''}>Web</option>
            <option value="Design" ${project?.category === 'Design' ? 'selected' : ''}>Design</option>
            <option value="Mobile" ${project?.category === 'Mobile' ? 'selected' : ''}>Mobile</option>
            <option value="Backend" ${project?.category === 'Backend' ? 'selected' : ''}>Backend</option>
            <option value="Other" ${project?.category === 'Other' ? 'selected' : ''}>Прочее</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="description">Описание</label>
          <textarea 
            id="description" 
            name="description" 
            rows="4"
            placeholder="Подробное описание проекта..."
          >${project?.description || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label for="link">Ссылка на проект</label>
          <input 
            type="url" 
            id="link" 
            name="link" 
            value="${project?.link || ''}"
            placeholder="https://example.com"
          />
        </div>
        
        <div class="form-group">
          <label for="image">URL изображения</label>
          <input 
            type="url" 
            id="image" 
            name="image" 
            value="${project?.image || ''}"
            placeholder="https://images.unsplash.com/..."
          />
        </div>
        
        <div class="form-group">
          <label for="tags">Теги (через запятую)</label>
          <input 
            type="text" 
            id="tags" 
            name="tags" 
            value="${project?.tags?.join(', ') || ''}"
            placeholder="react, css, responsive"
          />
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.history.back()">
            Отмена
          </button>
          <button type="submit" class="btn btn-primary" id="submitBtn">
            ${isEdit ? 'Сохранить изменения' : 'Создать проект'}
          </button>
        </div>
      </form>
    </div>
  `;
  
  const form = container.querySelector('#projectForm');
  const submitBtn = container.querySelector('#submitBtn');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Блокировка кнопки
    submitBtn.disabled = true;
    submitBtn.textContent = 'Сохранение...';
    
    try {
      const data = getFormData(form);
      
      if (isEdit) {
        await api.updateProject(id, { ...project, ...data });
        navigate(`/projects/${id}`);
      } else {
        const created = await api.createProject(data);
        navigate(`/projects/${created.id}`);
      }
    } catch (error) {
      alert('Ошибка сохранения: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? 'Сохранить изменения' : 'Создать проект';
    }
  });
}

// ============ РОУТЕР ============

/**
 * Главная функция роутера
 */
async function router() {
  const app = document.getElementById('app');
  const route = parseRoute();
  
  // #/projects или #/projects?q=search
  if (route.path === '/projects' || route.parts[0] === 'projects' && route.parts.length === 1) {
    await renderProjectsList(app, route.query.q || '');
  }
  // #/projects/new
  else if (route.parts[0] === 'projects' && route.parts[1] === 'new') {
    await renderProjectForm(app);
  }
  // #/projects/:id/edit
  else if (route.parts[0] === 'projects' && route.parts[2] === 'edit') {
    await renderProjectForm(app, route.parts[1]);
  }
  // #/projects/:id
  else if (route.parts[0] === 'projects' && route.parts[1]) {
    await renderProjectDetail(app, route.parts[1]);
  }
  // Неизвестный маршрут
  else {
    navigate('/projects');
  }
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

// Запуск роутера при изменении hash
window.addEventListener('hashchange', router);

// Запуск при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
  // Если hash пустой, перенаправляем на /projects
  if (!window.location.hash) {
    window.location.hash = '/projects';
  } else {
    router();
  }
});
