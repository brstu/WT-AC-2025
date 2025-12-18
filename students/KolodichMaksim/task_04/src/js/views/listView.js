import { getVacancies, deleteVacancy } from '../api.js';
import { router } from '../main.js';

export async function listView(params) {
  const app = document.getElementById('app');
  app.innerHTML = '<p class="loading">Загрузка...</p>';

  try {
    const search = new URLSearchParams(location.search).get('search') || '';
    const vacancies = await getVacancies(search);

    let html = `
      <input type="text" id="search" placeholder="Поиск..." value="${search}">
      <button id="searchBtn">Искать</button>
      <div id="list"></div>
    `;

    if (vacancies.length === 0) {
      html += '<p class="empty">Нет вакансий</p>';
    } else {
      vacancies.forEach(v => {
        html += `
          <div class="card">
            <h3><a href="#/vacancies/${v.id}">${v.title}</a></h3>
            <p>${v.company} | ${v.location} | ${v.salary}</p>
            <a href="#/vacancies/${v.id}/edit">Редактировать</a>
            <button class="delete" data-id="${v.id}">Удалить</button>
          </div>`;
      });
    }

    app.innerHTML = html;

    document.getElementById('searchBtn')?.addEventListener('click', () => {
      const val = document.getElementById('search').value;
      router.navigate(`/vacancies?search=${val}`);
    });

    document.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Удалить вакансию?')) {
          await deleteVacancy(btn.dataset.id);
          showNotification('Удалено!');
          listView(); // обновить
        }
      });
    });
  } catch (e) {
    app.innerHTML = `<p class="error">${e.message}</p>`;
  }
}