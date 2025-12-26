const API_URL = import.meta.env.VITE_API_URL || 'https://jsonplaceholder.typicode.com';

const img = (id) => `https://placehold.co/600x400?text=%D0%A1%D1%82%D0%B0%D1%80%D1%82%D0%B0%D0%BF+${id}`;

const normalize = (post) => ({
  id: post.id,
  name: post.title,
  description: post.body,
  sector: post.userId % 2 === 0 ? 'AI/ML' : 'FinTech',
  logo: img(post.id || Math.random().toFixed(2))
});

export async function fetchStartups() {
  const res = await fetch(`${API_URL}/posts?_limit=12`);
  const data = await res.json();
  return data.map(normalize);
}

export async function fetchStartup(id) {
  const res = await fetch(`${API_URL}/posts/${id}`);
  const data = await res.json();
  return normalize(data);
}

export async function createStartup(payload) {
  const res = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return normalize({ ...data, id: Math.floor(Math.random() * 999) });
}

export async function updateStartup(id, payload) {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return normalize({ ...data, id });
}

export async function deleteStartup(id) {
  await fetch(`${API_URL}/posts/${id}`, { method: 'DELETE' });
  return id;
}
