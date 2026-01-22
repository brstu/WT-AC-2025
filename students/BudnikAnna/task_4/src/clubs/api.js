const BASE_URL = "http://localhost:3000";

async function fetchJSON(path, { method = "GET", body, signal } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {}
    const err = new Error(
      `API ${res.status}: ${res.statusText}${detail ? ` — ${detail}` : ""}`
    );
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getClubs: ({ q = "", category = "" } = {}, signal) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    params.set("_sort", "createdAt");
    params.set("_order", "desc");
    return fetchJSON(`/clubs?${params.toString()}`, { signal });
  },

  getClub: (id, signal) => fetchJSON(`/clubs/${id}`, { signal }),

  createClub: (data, signal) =>
    fetchJSON(`/clubs`, {
      method: "POST",
      body: { ...data, createdAt: new Date().toISOString() },
      signal,
    }),

  updateClub: (id, data, signal) =>
    fetchJSON(`/clubs/${id}`, { method: "PUT", body: data, signal }),

  patchClub: (id, data, signal) =>
    fetchJSON(`/clubs/${id}`, { method: "PATCH", body: data, signal }),

  deleteClub: (id, signal) =>
    fetchJSON(`/clubs/${id}`, { method: "DELETE", signal }),

  createApplication: (data, signal) =>
    fetchJSON(`/applications`, {
      method: "POST",
      body: { ...data, createdAt: new Date().toISOString() },
      signal,
    }),

  getApplicationsByClub: (clubId, signal) => {
    const params = new URLSearchParams();
    params.set("clubId", String(clubId));
    params.set("_sort", "createdAt");
    params.set("_order", "desc");
    params.set("_limit", "5");
    return fetchJSON(`/applications?${params.toString()}`, { signal });
  },
};
