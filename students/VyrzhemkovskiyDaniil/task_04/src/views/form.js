import { api } from '../api.js';

const app = document.getElementById('app');

export async function renderForm(id) {
  let item = { title:'', genre:'', players:'', time:'', description:'' };

  if (id) item = await api.getOne(id) || item;

  app.innerHTML = `
<form id="form">
  <input name="title" required placeholder="Название" value="${item.title}" />
  <input name="genre" required placeholder="Жанр" value="${item.genre}" />
  <input name="players" required placeholder="Игроки" value="${item.players}" />
  <input name="time" required placeholder="Время (мин)" value="${item.time}" />
  <textarea name="description" required>${item.description}</textarea>
  <button>Сохранить</button>
</form>
`;

  const form = document.getElementById('form');

  form.onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    id ? await api.update(id, data) : await api.create(data);
    location.hash = '#/items';
  };
}
