const DEFAULT_BASE = "http://localhost:3000";
export const API_BASE = (window.__API_BASE__ || DEFAULT_BASE).replace(/\/$/, "");

async function request(path, { method = "GET", body, signal } = {}) {
  const url = `${API_BASE}${path}`;
  const init = {
    method,
    headers: { "Content-Type": "application/json" },
    signal
  };
  if (body !== undefined) init.body = JSON.stringify(body);

  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getItems({ q } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q); // json-server full-text search
  params.set("_sort", "createdAt");
  params.set("_order", "desc");
  const qs = params.toString() ? `?${params.toString()}` : "";
  return request(`/items${qs}`);
}

export function getItem(id) {
  return request(`/items/${id}`);
}

export function createItem(data) {
  return request(`/items`, { method: "POST", body: data });
}

export function updateItem(id, data) {
  // PATCH по заданию разрешён (или PUT)
  return request(`/items/${id}`, { method: "PATCH", body: data });
}

export function deleteItem(id) {
  return request(`/items/${id}`, { method: "DELETE" });
}
