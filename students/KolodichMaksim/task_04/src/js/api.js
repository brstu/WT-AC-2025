const API_BASE = 'http://localhost:3001/vacancies';

export async function getVacancies(search = '') {
  const res = await fetch(`${API_BASE}?q=${search}`);
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
}

export async function getVacancy(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Вакансия не найдена');
  return res.json();
}

export async function createVacancy(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Ошибка создания');
  return res.json();
}

export async function updateVacancy(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Ошибка обновления');
  return res.json();
}

export async function deleteVacancy(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Ошибка удаления');
}