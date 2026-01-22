const API = import.meta.env.VITE_API_URL;

export async function getItems() {
  const res = await fetch(`${API}/tasks`);
  if (!res.ok) throw new Error("Ошибка загрузки");
  return res.json();
}

export async function getItem(id) {
  const res = await fetch(`${API}/tasks/${id}`);
  if (!res.ok) throw new Error("Не найдено");
  return res.json();
}

export async function createItem(data) {
  const res = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Ошибка создания");
  return res.json();
}

export async function updateItem(id, data) {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Ошибка обновления");
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Ошибка удаления");
}
