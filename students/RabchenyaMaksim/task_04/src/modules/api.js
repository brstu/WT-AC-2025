const API_URL = 'http://localhost:3000/notes'; // json-server

export const api = {
  async getAll(search = '') {
    const url = search ? `${API_URL}?q=${encodeURIComponent(search)}` : API_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Не удалось загрузить заметки');
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Заметка не найдена');
    return res.json();
  },

  async create(data) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Ошибка создания');
    return res.json();
  },

  async update(id, data) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Ошибка обновления');
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Ошибка удаления');
    return true;
  }
};