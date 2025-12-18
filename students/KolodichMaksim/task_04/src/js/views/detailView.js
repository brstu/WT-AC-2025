import { getVacancy } from '../api.js';

export async function detailView({ id }) {
  const app = document.getElementById('app');
  app.innerHTML = '<p class="loading">Загрузка...</p>';

  try {
    const vac = await getVacancy(id);
    app.innerHTML = `
      <div class="card">
        <h2>${vac.title}</h2>
        <p><strong>Компания:</strong> ${vac.company}</p>
        <p><strong>Локация:</strong> ${vac.location}</p>
        <p><strong>Зарплата:</strong> ${vac.salary}</p>
        <p><strong>Описание:</strong> ${vac.description}</p>
        <a href="#/vacancies">Назад</a>
      </div>
    `;
  } catch (e) {
    app.innerHTML = `<p class="error">${e.message}</p>`;
  }
}