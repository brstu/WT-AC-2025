const BASE_URL = 'http://localhost:3000/items';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export const api = {
  getAll: () => request(BASE_URL),
  getOne: id => request(`${BASE_URL}/${id}`),
  create: data =>
    request(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    request(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  remove: id =>
    request(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    })
};
