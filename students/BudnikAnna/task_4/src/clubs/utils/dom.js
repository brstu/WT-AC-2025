export function qs(root, sel) {
  const el = root.querySelector(sel);
  if (!el) throw new Error(`Не найден элемент: ${sel}`);
  return el;
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatDate(iso) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return String(iso ?? "");
  }
}
