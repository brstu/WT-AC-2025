const API_URL = 'http://localhost:4000';

function getToken() { return localStorage.getItem('token'); }

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function apiRequest(endpoint, method, path = '', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Try remote API first, fallback to local db.json when running without server
    try {
      const url = `${API_URL}/${endpoint}${path}`;
      const res = await fetchJson(url, { method, headers, body: body ? JSON.stringify(body) : null });
      return res;
    } catch (err) {
      // Fallback: read local db.json structure
      try {
        const local = await fetchJson('/db.json');
        // handle destinations endpoint with optional query or id
        if (endpoint === 'destinations') {
          // query string like ?q=term
          if (method === 'GET' && path && path.startsWith('?')) {
            const params = new URLSearchParams(path.slice(1));
            const q = params.get('q') || params.get('q') === '' ? params.get('q') : null;
            const arr = local.destinations || local;
            if (!q) return arr;
            const term = q.toLowerCase();
            return arr.filter(i => (i.name || '').toLowerCase().includes(term) || (i.location || '').toLowerCase().includes(term));
          }
          if (method === 'GET' && !path) return local.destinations || local;
          if (method === 'GET' && path.startsWith('/')) {
            const id = path.replace('/', '');
            const found = (local.destinations || local).find(i => String(i.id) === String(id));
            if (!found) throw err; else return found;
          }
          if (method === 'POST') {
            // naive: append and return created
            const arr = local.destinations || local;
            const newItem = { id: Date.now(), ...body };
            arr.push(newItem);
            return newItem;
          }
          if (method === 'PATCH') {
            const id = path.replace('/', '');
            const arr = local.destinations || local;
            const idx = arr.findIndex(i => String(i.id) === String(id));
            if (idx === -1) throw err;
            arr[idx] = { ...arr[idx], ...body };
            return arr[idx];
          }
          if (method === 'DELETE') {
            const id = path.replace('/', '');
            const arr = local.destinations || local;
            const idx = arr.findIndex(i => String(i.id) === String(id));
            if (idx === -1) throw err;
            const removed = arr.splice(idx, 1)[0];
            return removed;
          }
        }
        // handle users endpoint basic fallback
        if (endpoint === 'users') {
          const usersArr = local.users || [];
          if (method === 'GET' && path && path.startsWith('?')) {
            const params = new URLSearchParams(path.slice(1));
            const username = params.get('username');
            if (username) return usersArr.filter(u => u.username === username);
            return usersArr;
          }
          if (method === 'POST') {
            const newUser = { id: Date.now(), ...body };
            usersArr.push(newUser);
            return newUser;
          }
        }
        throw err;
      } catch (localErr) {
        throw err; // rethrow original remote error
      }
    }
  }


export async function getList(query = '') {
  return apiRequest('destinations', 'GET', query ? `?${query}` : '');
}

export async function getDetail(id) {
  return apiRequest('destinations', 'GET', `/${id}`);
}

export async function createItem(item) { return apiRequest('destinations', 'POST', '', item); }
export async function updateItem(id, item) { return apiRequest('destinations', 'PATCH', `/${id}`, item); }
export async function deleteItem(id) { return apiRequest('destinations', 'DELETE', `/${id}`); }

export async function register(username, password) {
  // naive local register via users endpoint if present; otherwise error
  const users = await apiRequest('users', 'GET', `?username=${username}`).catch(() => []);
  if (users && users.length > 0) throw new Error('Username taken');
  await apiRequest('users', 'POST', '', { username, password }).catch(() => null);
  return login(username, password);
}

export async function login(username, password) {
  const users = await apiRequest('users', 'GET', `?username=${username}`).catch(() => []);
  if (!users || users.length === 0) {
    // fallback: allow any username/password for local demo
    const token = 'fake-jwt-' + username;
    localStorage.setItem('token', token);
    return token;
  }
  if (users[0].password !== password) throw new Error('Invalid credentials');
  const token = 'fake-jwt-' + username;
  localStorage.setItem('token', token);
  return token;
}

export function logout() { localStorage.removeItem('token'); }